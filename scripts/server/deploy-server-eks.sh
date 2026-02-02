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

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
IMAGE_TAG="${2}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
KUBERNETES_DIR="${PROJECT_ROOT}/server/kubernetes"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"
NAMESPACE="recipe-manager"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
  echo -e "${BLUE}[STEP]${NC} $1"
}

get_terraform_output() {
  local output_name="$1"
  terraform -chdir="${TERRAFORM_DIR}" output -raw "${output_name}"
}

get_tfvars_value() {
  local key="$1"
  local tfvars_file="${TERRAFORM_DIR}/terraform.tfvars"

  if [[ ! -f "${tfvars_file}" ]]; then
    log_error "terraform.tfvars not found at ${tfvars_file}"
    return 1
  fi

  # Extract value between quotes, handling optional spaces
  grep "^\s*${key}\s*=" "${tfvars_file}" | head -n1 | sed -E 's/^[^"]*"([^"]*)".*$/\1/'
}

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
if [[ "${ENVIRONMENT}" != "dev" && "${ENVIRONMENT}" != "prod" ]]; then
  log_error "Invalid environment: ${ENVIRONMENT}. Must be 'dev' or 'prod'."
  exit 1
fi

# Check if Terraform directory exists
if [[ ! -d "${TERRAFORM_DIR}" ]]; then
  log_error "Terraform directory not found: ${TERRAFORM_DIR}"
  exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &>/dev/null; then
  log_error "Terraform is not installed. Please install it and try again."
  exit 1
fi

# Check if Kubernetes directory exists
if [[ ! -d "${KUBERNETES_DIR}" ]]; then
  log_error "Kubernetes directory not found: ${KUBERNETES_DIR}"
  exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &>/dev/null; then
  log_error "kubectl is not installed. Please install it and try again."
  exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &>/dev/null; then
  log_error "AWS CLI is not installed. Please install it and try again."
  exit 1
fi

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

log_info "Fetching secrets from AWS Secrets Manager..."
RDS_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "recipe-manager-rds-master-password-${ENVIRONMENT}" \
  --query SecretString \
  --output text)

JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "recipe-manager-jwt-secret-${ENVIRONMENT}" \
  --query SecretString \
  --output text)

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
trap "rm -rf ${TEMP_DIR}" EXIT

# Generate manifests using kustomize
kubectl kustomize "${KUBERNETES_DIR}/overlays/${ENVIRONMENT}" > "${TEMP_DIR}/manifests.yaml"

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
log_step "Deployment complete! Checking status..."
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

# Check if the ingress has an address assigned
INGRESS_ADDRESS=$(kubectl get ingress recipe-manager-api -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
if [[ -n "${INGRESS_ADDRESS}" ]]; then
  log_info "Load balancer hostname: ${INGRESS_ADDRESS}"
  echo ""
  log_info "Next step:"
  echo ""
  echo "  Create the Route53 A record for the API endpoint:"
  echo "     cd ${TERRAFORM_DIR}"
  echo "     terraform apply -target=module.api_endpoint_dns_record"
  echo ""
  log_warn "This will create a Route53 A record for ${API_ENDPOINT} pointing to the ALB."
else
  log_warn "Ingress address not yet assigned. It may take a few minutes for the ALB to be created."
  log_warn "Run 'kubectl get ingress recipe-manager-api' to check the status."
  echo ""
  log_info "Once the ALB is created, run the following to create the Route53 A record:"
  echo "     cd ${TERRAFORM_DIR}"
  echo "     terraform apply -target=module.api_endpoint_dns_record"
fi
