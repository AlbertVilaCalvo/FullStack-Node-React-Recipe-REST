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
#
# NOTE: In the GitOps workflow, this script is NOT required. Argo CD automatically
#       detects commits that update kustomization.yaml (done by the GitHub Actions
#       workflow) and syncs the cluster. Use this script only for manual deployment.

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

validate_environment "${ENVIRONMENT}"

validate_directory_exists "${TERRAFORM_DIR}"
validate_directory_exists "${KUBERNETES_DIR}"

validate_command_exists terraform
validate_command_exists kubectl
validate_command_exists kustomize
validate_command_exists aws

# ============================================================================
# Main Script
# ============================================================================

log_info "Deploying server to environment: ${ENVIRONMENT}"
log_info "Image tag: ${IMAGE_TAG}"

log_step "Step 1/6: Fetching all required values from Terraform outputs and terraform.tfvars..."
log_info "Fetching configuration from Terraform outputs..."

CLUSTER_NAME=$(get_terraform_output "cluster_name")
ECR_REPOSITORY_URL=$(get_terraform_output "ecr_repository_url")

log_info "Fetching configuration from terraform.tfvars..."

API_DOMAIN=$(get_tfvars_value "api_domain")
WEB_DOMAIN=$(get_tfvars_value "web_domain")
AWS_REGION=$(get_tfvars_value "aws_region")

log_info "Fetching AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [[ -z "${AWS_ACCOUNT_ID}" ]]; then
  log_error "Failed to fetch AWS account ID. Please check your AWS credentials."
  exit 1
fi

FULL_IMAGE_URL="${ECR_REPOSITORY_URL}:${IMAGE_TAG}"

log_info "AWS Region: ${AWS_REGION}"
log_info "Cluster Name: ${CLUSTER_NAME}"
log_info "ECR Repository URL: ${ECR_REPOSITORY_URL}"
log_info "API domain: ${API_DOMAIN}"
log_info "Web domain: ${WEB_DOMAIN}"
log_info "Full image URL: ${FULL_IMAGE_URL}"

# Update kubectl config
log_step "Step 2/6: Updating kubectl configuration..."
aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"

# Verify cluster connectivity
log_step "Step 3/6: Verifying cluster connectivity..."
if ! kubectl cluster-info >/dev/null 2>&1; then
  log_error "Cannot connect to the Kubernetes cluster. Please check your AWS credentials and network connectivity."
  exit 1
fi
log_info "Successfully connected to cluster"

# Process Kustomize overlay and apply substitutions
log_step "Step 4/6: Processing Kubernetes manifests..."

# Create temporary directory for processed manifests
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

OVERLAY_DIR="${KUBERNETES_DIR}/overlays/${ENVIRONMENT}"

# Update the image in the kustomization.yaml before generating manifests
# This adds the following to the dev or prod kustomization.yaml:
# images:
#   - name: recipe-manager-api-server
#     newName: 123456789012.dkr.ecr.us-east-1.amazonaws.com/recipe-manager-server-dev
#     newTag: abc1234
pushd "${OVERLAY_DIR}" >/dev/null
kustomize edit set image recipe-manager-api-server="${FULL_IMAGE_URL}"
popd >/dev/null

# Generate manifests using kustomize
kubectl kustomize "${OVERLAY_DIR}" >"${TEMP_DIR}/manifests.yaml"

# Apply the manifests
log_step "Step 5/6: Applying Kubernetes manifests..."
kubectl apply -f "${TEMP_DIR}/manifests.yaml"

# Wait for deployment to roll out
log_step "Step 6/6: Waiting for deployment to complete..."
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
log_info "API domain: https://${API_DOMAIN}"
log_info "Website domain: https://${WEB_DOMAIN}"
echo ""
