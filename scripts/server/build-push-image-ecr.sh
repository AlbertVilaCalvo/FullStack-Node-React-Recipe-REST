#!/bin/bash
#
# Build and push server Docker image to ECR
#
# Usage:
#   ./scripts/server/build-push-image-ecr.sh [environment]
#
# Usage examples:
#   ./scripts/server/build-push-image-ecr.sh dev     # Build for dev environment
#   ./scripts/server/build-push-image-ecr.sh prod    # Build for prod environment
#
# Arguments:
#   environment - The deployment environment (dev or prod).
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Docker installed and running
#   - Terraform outputs available in terraform/server/environments/<environment>

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SERVER_DIR="${PROJECT_ROOT}/server"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"

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

# Check if server directory exists
if [[ ! -d "${SERVER_DIR}" ]]; then
  log_error "Server directory not found: ${SERVER_DIR}"
  exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  log_error "Docker is not running. Please start Docker and try again."
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

log_info "Building Docker image for environment: ${ENVIRONMENT}"

# Get ECR repository URL from Terraform outputs
log_step "Step 1/5: Fetching all required values from Terraform outputs and terraform.tfvars..."
ECR_REPOSITORY_URL=$(get_terraform_output "ecr_repository_url")
if [[ -z "${ECR_REPOSITORY_URL}" ]]; then
  log_error "Could not get ecr_repository_url from Terraform outputs."
  log_error "Make sure you have run 'terraform apply' in ${TERRAFORM_DIR}"
  exit 1
fi

# Get AWS region from terraform.tfvars
AWS_REGION=$(get_tfvars_value "aws_region")
if [[ -z "${AWS_REGION}" ]]; then
  log_error "Could not get aws_region from terraform.tfvars."
  exit 1
fi

log_info "ECR Repository URL: ${ECR_REPOSITORY_URL}"
log_info "AWS Region: ${AWS_REGION}"

# Generate image tag using timestamp
IMAGE_TAG=$(date +%Y-%m-%d-%Hh%Mm%Ss)
log_info "Image tag: ${IMAGE_TAG}"

# Log in to ECR
log_step "Step 2/5: Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REPOSITORY_URL}"

# Build the Docker image
log_step "Step 3/5: Building Docker image..."
cd "${SERVER_DIR}"
docker build \
  --platform linux/amd64 \
  -t "recipe-manager-server:${IMAGE_TAG}" \
  .

# Tag the image for ECR
log_step "Step 4/5: Tagging image for ECR..."
docker tag "recipe-manager-server:${IMAGE_TAG}" "${ECR_REPOSITORY_URL}:${IMAGE_TAG}"

# Push the image to ECR
log_step "Step 5/5: Pushing image to ECR..."
docker push "${ECR_REPOSITORY_URL}:${IMAGE_TAG}"

log_info "Successfully built and pushed image to ECR"
log_info "Image URL: ${ECR_REPOSITORY_URL}:${IMAGE_TAG}"

# Output the image tag for use in deployment
echo ""
echo "=========================================="
echo "IMAGE_TAG=${IMAGE_TAG}"
echo "IMAGE_URL=${ECR_REPOSITORY_URL}:${IMAGE_TAG}"
echo "=========================================="
echo ""
log_info "To deploy this image, run:"
echo ""
echo "  ./scripts/server/deploy-server-eks.sh ${ENVIRONMENT} ${IMAGE_TAG}"
echo ""
