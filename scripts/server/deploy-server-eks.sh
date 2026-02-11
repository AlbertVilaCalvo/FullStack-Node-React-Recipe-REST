#!/bin/bash
#
# Deploy server Kubernetes manifests to the EKS cluster
#
# Usage:
#   ./scripts/server/deploy-server-eks.sh <environment> <image_tag>
#
# Usage examples:
#   ./scripts/server/deploy-server-eks.sh dev 2026-01-15-12h00m00s   # Deploy specific tag to dev
#   ./scripts/server/deploy-server-eks.sh prod 2026-01-15-12h00m00s  # Deploy specific tag to prod
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
KUBERNETES_DIR="${PROJECT_ROOT}/server/kubernetes"
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

log_step "Step 1/6: Fetching all required values from Terraform outputs, terraform.tfvars, AWS Secrets Manager..."
log_info "Fetching configuration from Terraform outputs..."

CLUSTER_NAME=$(get_terraform_output "cluster_name")
ECR_REPOSITORY_URL=$(get_terraform_output "ecr_repository_url")
RDS_ADDRESS=$(get_terraform_output "rds_address")
RDS_DATABASE_NAME=$(get_terraform_output "rds_database_name")
RDS_USERNAME=$(get_terraform_output "rds_username")
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

if [[ -z "${RDS_DATABASE_NAME}" ]]; then
  MISSING_OUTPUTS+=("rds_database_name")
fi

if [[ -z "${RDS_USERNAME}" ]]; then
  MISSING_OUTPUTS+=("rds_username")
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

API_ENDPOINT=$(get_tfvars_value "api_endpoint")
WEB_DOMAIN=$(get_tfvars_value "web_domain")
AWS_REGION=$(get_tfvars_value "aws_region")
EMAIL_USER=$(get_tfvars_value "email_user")
EMAIL_PASSWORD=$(get_tfvars_value "email_password")

# Validate required terraform.tfvars values
MISSING_TFVARS=()

if [[ -z "${API_ENDPOINT}" ]]; then
  MISSING_TFVARS+=("api_endpoint")
fi

if [[ -z "${WEB_DOMAIN}" ]]; then
  MISSING_TFVARS+=("web_domain")
fi

if [[ -z "${AWS_REGION}" ]]; then
  MISSING_TFVARS+=("aws_region")
fi

if [[ -z "${EMAIL_USER}" ]]; then
  MISSING_TFVARS+=("email_user")
fi

if [[ -z "${EMAIL_PASSWORD}" ]]; then
  MISSING_TFVARS+=("email_password")
fi

if [[ ${#MISSING_TFVARS[@]} -gt 0 ]]; then
  log_error "Missing required Terraform values in terraform.tfvars: ${MISSING_TFVARS[*]}"
  exit 1
fi

log_info "Fetching AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

log_info "Fetching secrets from AWS Secrets Manager..."
RDS_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "recipe-manager-rds-master-password-${ENVIRONMENT}" \
  --query SecretString \
  --output text)

JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "recipe-manager-jwt-secret-${ENVIRONMENT}" \
  --query SecretString \
  --output text)

# Validate AWS account ID and secrets
MISSING_RESOURCES=()

if [[ -z "${AWS_ACCOUNT_ID}" ]]; then
  MISSING_RESOURCES+=("AWS_ACCOUNT_ID")
fi

if [[ -z "${RDS_PASSWORD}" ]]; then
  MISSING_RESOURCES+=("RDS_PASSWORD")
fi

if [[ -z "${JWT_SECRET}" ]]; then
  MISSING_RESOURCES+=("JWT_SECRET")
fi

if [[ ${#MISSING_RESOURCES[@]} -gt 0 ]]; then
  log_error "Missing required resources: ${MISSING_RESOURCES[*]}"
  log_error "Please check your AWS credentials and ensure the secrets exist in Secrets Manager."
  exit 1
fi

CORS_ORIGINS="https://${WEB_DOMAIN},https://www.${WEB_DOMAIN}"

FULL_IMAGE_URL="${ECR_REPOSITORY_URL}:${IMAGE_TAG}"

log_info "AWS Region: ${AWS_REGION}"
log_info "Cluster Name: ${CLUSTER_NAME}"
log_info "ECR Repository URL: ${ECR_REPOSITORY_URL}"
log_info "RDS Address: ${RDS_ADDRESS}"
log_info "API Endpoint: ${API_ENDPOINT}"
log_info "Web Domain: ${WEB_DOMAIN}"
log_info "CORS origins: ${CORS_ORIGINS}"
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

# Generate manifests using kustomize
kubectl kustomize "${KUBERNETES_DIR}/overlays/${ENVIRONMENT}" >"${TEMP_DIR}/manifests.yaml"

# Replace placeholders in the generated manifests
sed -i.bak \
  -e "s|REPLACE_WITH_ECR_IMAGE_URL|${FULL_IMAGE_URL}|g" \
  -e "s|REPLACE_WITH_API_CERTIFICATE_ARN|${API_CERTIFICATE_ARN}|g" \
  -e "s|REPLACE_WITH_API_ENDPOINT|${API_ENDPOINT}|g" \
  -e "s|REPLACE_WITH_RDS_ADDRESS|${RDS_ADDRESS}|g" \
  -e "s|REPLACE_WITH_RDS_DATABASE_NAME|${RDS_DATABASE_NAME}|g" \
  -e "s|REPLACE_WITH_RDS_USERNAME|${RDS_USERNAME}|g" \
  -e "s|REPLACE_WITH_RDS_PASSWORD|${RDS_PASSWORD}|g" \
  -e "s|REPLACE_WITH_CORS_ORIGINS|${CORS_ORIGINS}|g" \
  -e "s|REPLACE_WITH_JWT_SECRET|${JWT_SECRET}|g" \
  -e "s|REPLACE_WITH_EMAIL_USER|${EMAIL_USER}|g" \
  -e "s|REPLACE_WITH_EMAIL_PASSWORD|${EMAIL_PASSWORD}|g" \
  "${TEMP_DIR}/manifests.yaml"

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
kubectl get deployment recipe-manager-api

echo ""
log_info "Pods:"
kubectl get pods -l app=recipe-manager

echo ""
log_info "Service:"
kubectl get service recipe-manager-api

echo ""
log_info "Ingress:"
kubectl get ingress recipe-manager-api

echo ""
log_info "Deployment successful!"
log_info "API endpoint: https://${API_ENDPOINT}"
log_info "Website URL: https://${WEB_DOMAIN}"
echo ""
