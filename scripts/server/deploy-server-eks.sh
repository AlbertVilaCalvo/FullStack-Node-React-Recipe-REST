#!/bin/bash
#
# Deploy server Kubernetes manifests to the EKS cluster
#
# Usage:
#   ./scripts/server/deploy-server-eks.sh <environment> <image_tag>
#
# Usage examples:
#   ./scripts/server/deploy-server-eks.sh dev abc1234   # Deploy specific tag to dev
#   ./scripts/server/deploy-server-eks.sh prod abc1234  # Deploy specific tag to prod
#
# Arguments:
#   environment - The deployment environment (dev or prod)
#   image_tag   - The Docker image tag to deploy (required, use output from build-push-image-ecr.sh)
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - kubectl installed and configured
#   - Terraform outputs available in terraform/server/environments/<environment>
#   - Docker image already pushed to ECR (run build-push-image-ecr.sh first)

set -euo pipefail

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/../lib/common.sh"

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
IMAGE_TAG="${2}"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
KUBERNETES_DIR="${PROJECT_ROOT}/kubernetes/server"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"
NAMESPACE="recipe-manager"

# ============================================================================
# Validation
# ============================================================================

# Validate required arguments
if [[ -z "${ENVIRONMENT}" ]]; then
  log_error "Environment is required."
  log_error "Usage: ./scripts/server/deploy-server-eks.sh <environment> <image_tag>"
  log_error "Example: ./scripts/server/deploy-server-eks.sh dev 2026-01-15-12h00m00s"
  exit 1
fi

if [[ -z "${IMAGE_TAG}" ]]; then
  log_error "Image tag is required."
  log_error "Usage: ./scripts/server/deploy-server-eks.sh <environment> <image_tag>"
  log_error "Example: ./scripts/server/deploy-server-eks.sh dev 2026-01-15-12h00m00s"
  exit 1
fi

# Validate environment argument
validate_environment "${ENVIRONMENT}"

# Check if Terraform directory exists
validate_directory_exists "${TERRAFORM_DIR}"

# Check if Terraform is installed
validate_command_exists terraform

# Check if Kubernetes directory exists
validate_directory_exists "${KUBERNETES_DIR}"

# Check if kubectl is installed
validate_command_exists kubectl

# Check if AWS CLI is installed
validate_command_exists aws

# ============================================================================
# Main Script
# ============================================================================

log_info "Deploying server to environment: ${ENVIRONMENT}"
log_info "Image tag: ${IMAGE_TAG}"

log_step "Step 1/5: Fetching required values from Terraform outputs and terraform.tfvars..."
log_info "Fetching configuration from Terraform outputs..."

CLUSTER_NAME=$(get_terraform_output "cluster_name")
ECR_REPOSITORY_URL=$(get_terraform_output "ecr_repository_url")
RDS_ADDRESS=$(get_terraform_output "rds_address")
API_CERTIFICATE_ARN=$(get_terraform_output "api_certificate_arn")

# Validate all required Terraform outputs
MISSING_OUTPUTS=()

if [[ -z "${CLUSTER_NAME}" ]]; then
  MISSING_OUTPUTS+=("cluster_name")
fi

if [[ -z "${ECR_REPOSITORY_URL}" ]]; then
  MISSING_OUTPUTS+=("ecr_repository_url")
fi

if [[ -z "${RDS_ADDRESS}" ]]; then
  MISSING_OUTPUTS+=("rds_address")
fi

if [[ -z "${API_CERTIFICATE_ARN}" ]]; then
  MISSING_OUTPUTS+=("api_certificate_arn")
fi

if [[ ${#MISSING_OUTPUTS[@]} -gt 0 ]]; then
  log_error "Missing required Terraform outputs: ${MISSING_OUTPUTS[*]}"
  log_error ""
  log_error "This typically means the infrastructure has not been fully created."
  log_error "Please ensure you have completed all infrastructure setup steps:"
  log_error ""
  log_error "1. Run the infrastructure creation script:"
  log_error "   ./scripts/server/create-aws-infrastructure.sh ${ENVIRONMENT}"
  log_error ""
  exit 1
fi

log_info "Fetching configuration from terraform.tfvars..."

AWS_REGION=$(get_tfvars_value "aws_region")
API_ENDPOINT=$(get_tfvars_value "api_endpoint")

# Validate required terraform.tfvars values
MISSING_TFVARS=()

if [[ -z "${AWS_REGION}" ]]; then
  MISSING_TFVARS+=("aws_region")
fi

if [[ -z "${API_ENDPOINT}" ]]; then
  MISSING_TFVARS+=("api_endpoint")
fi

if [[ ${#MISSING_TFVARS[@]} -gt 0 ]]; then
  log_error "Missing required Terraform values in terraform.tfvars: ${MISSING_TFVARS[*]}"
  exit 1
fi

log_info "Fetching AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [[ -z "${AWS_ACCOUNT_ID}" ]]; then
  log_error "Failed to fetch AWS account ID. Please check your AWS credentials."
  exit 1
fi

log_info "AWS Region: ${AWS_REGION}"
log_info "Cluster Name: ${CLUSTER_NAME}"
log_info "ECR Repository URL: ${ECR_REPOSITORY_URL}"
log_info "RDS Address: ${RDS_ADDRESS}"
log_info "API Endpoint: ${API_ENDPOINT}"
log_info "Image tag: ${IMAGE_TAG}"

# Update kubectl config
log_step "Step 2/5: Updating kubectl configuration..."
aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"

# Verify cluster connectivity
log_step "Step 3/5: Verifying cluster connectivity..."
if ! kubectl cluster-info >/dev/null 2>&1; then
  log_error "Cannot connect to the Kubernetes cluster. Please check your AWS credentials and network connectivity."
  exit 1
fi
log_info "Successfully connected to cluster"

# Build final manifests using a temporary Kustomize overlay.
# The committed overlay in ${KUBERNETES_DIR}/overlays/${ENVIRONMENT} contains all static
# per-environment values. Here we layer on top of it the three remaining dynamic values
# that are Terraform outputs and therefore unknown until infrastructure exists:
#   - image name + tag  (ECR URL and git SHA, set via the 'images' transformer)
#   - DB_HOST           (RDS address, set via a ConfigMap patch)
#   - certificate-arn   (ACM cert ARN, set via an Ingress patch)
log_step "Step 4/5: Processing Kubernetes manifests..."

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

cat >"${TEMP_DIR}/kustomization.yaml" <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ${KUBERNETES_DIR}/overlays/${ENVIRONMENT}

images:
  - name: recipe-manager-api
    newName: ${ECR_REPOSITORY_URL}
    newTag: ${IMAGE_TAG}

patches:
  - patch: |-
      apiVersion: v1
      kind: ConfigMap
      metadata:
        name: recipe-manager-api-config
        namespace: recipe-manager
      data:
        DB_HOST: '${RDS_ADDRESS}'
  - patch: |-
      apiVersion: networking.k8s.io/v1
      kind: Ingress
      metadata:
        name: recipe-manager-api
        namespace: recipe-manager
        annotations:
          alb.ingress.kubernetes.io/certificate-arn: '${API_CERTIFICATE_ARN}'
EOF

# Apply the manifests
log_step "Step 5/5: Applying Kubernetes manifests..."
kubectl kustomize --load-restrictor=none "${TEMP_DIR}" | kubectl apply -f -

# Wait for deployment to roll out
kubectl rollout status deployment/recipe-manager-api -n "${NAMESPACE}" --timeout=300s

# Set default namespace for context to avoid specifying -n each time
kubectl config set-context "arn:aws:eks:${AWS_REGION}:${AWS_ACCOUNT_ID}:cluster/${CLUSTER_NAME}" --namespace "${NAMESPACE}"

# Display deployment status
log_info "Deployment complete! Checking status..."
echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""

log_info "Deployment:"
kubectl get deployment recipe-manager-api -n "${NAMESPACE}"

echo ""
log_info "Pods:"
kubectl get pods -l app=recipe-manager -n "${NAMESPACE}"

echo ""
log_info "Service:"
kubectl get service recipe-manager-api -n "${NAMESPACE}"

echo ""
log_info "Ingress:"
kubectl get ingress recipe-manager-api -n "${NAMESPACE}"

echo ""
log_info "Deployment successful!"
log_info "API endpoint: https://${API_ENDPOINT}"
echo ""
