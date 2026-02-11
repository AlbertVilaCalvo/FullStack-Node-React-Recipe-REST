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

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/../lib/common.sh"

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SERVER_DIR="${PROJECT_ROOT}/server"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"

# ============================================================================
# Validation
# ============================================================================

# Validate required argument
if [[ -z "${ENVIRONMENT}" ]]; then
  log_error "Environment is required."
  log_error "Usage: ./scripts/server/delete-aws-infrastructure.sh <environment>"
  log_error "Example: ./scripts/server/delete-aws-infrastructure.sh dev"
  exit 1
fi

# Validate environment argument
validate_environment "${ENVIRONMENT}"

# Check if Terraform directory exists
validate_directory_exists "${TERRAFORM_DIR}"

# Check if server directory exists
validate_directory_exists "${SERVER_DIR}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  log_error "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if AWS CLI is installed
validate_command_exists aws

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
