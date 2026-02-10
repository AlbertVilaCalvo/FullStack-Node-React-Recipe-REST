#!/bin/bash
#
# Create S3 bucket for Terraform state and generate backend.config files
#
# Usage:
#   ./scripts/bootstrap/create-state-bucket.sh <environment>
#
# Usage examples:
#   ./scripts/bootstrap/create-state-bucket.sh dev    # Create dev bucket
#   ./scripts/bootstrap/create-state-bucket.sh prod   # Create prod bucket
#
# Arguments:
#   environment - The deployment environment (dev or prod)
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Terraform installed

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/bootstrap/environments/${ENVIRONMENT}"
SERVER_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"
WEB_DIR="${PROJECT_ROOT}/terraform/web/environments/${ENVIRONMENT}"

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
  log_error "Usage: ./scripts/bootstrap/create-state-bucket.sh <environment>"
  log_error "Example: ./scripts/bootstrap/create-state-bucket.sh dev"
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

# Check if AWS CLI is installed
if ! command -v aws &>/dev/null; then
  log_error "AWS CLI is not installed. Please install it and try again."
  exit 1
fi

# Check if server environment directory exists
if [[ ! -d "${SERVER_DIR}" ]]; then
  log_error "Server environment directory not found: ${SERVER_DIR}"
  exit 1
fi

# Check if web environment directory exists
if [[ ! -d "${WEB_DIR}" ]]; then
  log_error "Web environment directory not found: ${WEB_DIR}"
  exit 1
fi

# ============================================================================
# Main Script
# ============================================================================

log_info "Creating Terraform state bucket for environment: ${ENVIRONMENT}"
echo ""

cd "${TERRAFORM_DIR}"

# Step 1: Initialize Terraform
log_step "Step 1/3: Initializing Terraform..."
terraform init

# Step 2: Apply Terraform configuration
log_step "Step 2/3: Creating S3 bucket..."
terraform apply -auto-approve

# Get Outputs
BUCKET_NAME=$(get_terraform_output "state_bucket")
AWS_REGION=$(get_tfvars_value "aws_region")

if [[ -z "${BUCKET_NAME}" ]]; then
  log_error "Failed to get state_bucket output from Terraform."
  exit 1
fi
if [[ -z "${AWS_REGION}" ]]; then
  log_error "Failed to get aws_region from terraform.tfvars."
  exit 1
fi

log_info "State bucket created: ${BUCKET_NAME} in ${AWS_REGION}"

# Step 3: Generate backend.config content
log_step "Step 3/3: Generating backend.config files..."
BACKEND_CONFIG_CONTENT="bucket = \"${BUCKET_NAME}\"
region = \"${AWS_REGION}\""

# Server
echo "${BACKEND_CONFIG_CONTENT}" > "${SERVER_DIR}/backend.config"
log_info "Created ${SERVER_DIR}/backend.config"

# Web
echo "${BACKEND_CONFIG_CONTENT}" > "${WEB_DIR}/backend.config"
log_info "Created ${WEB_DIR}/backend.config"

# Display summary
echo ""
echo "=========================================="
echo "Bootstrap Complete!"
echo "=========================================="
echo ""

log_info "Next steps:"
echo ""
echo "  1. Create the server infrastructure:"
echo "     ./scripts/server/create-aws-infrastructure.sh ${ENVIRONMENT}"
echo ""
echo "  2. Create the web infrastructure:"
echo "     ./scripts/web/create-aws-infrastructure.sh ${ENVIRONMENT}"
echo ""
