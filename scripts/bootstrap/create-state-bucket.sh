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

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/../lib/common.sh"

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/bootstrap/environments/${ENVIRONMENT}"
SERVER_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"
WEB_DIR="${PROJECT_ROOT}/terraform/web/environments/${ENVIRONMENT}"

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
validate_environment "${ENVIRONMENT}"

# Check if Terraform directory exists
validate_directory_exists "${TERRAFORM_DIR}"

# Check if Terraform is installed
validate_command_exists terraform

# Check if AWS CLI is installed
validate_command_exists aws

# Check if server environment directory exists
validate_directory_exists "${SERVER_DIR}"

# Check if web environment directory exists
validate_directory_exists "${WEB_DIR}"

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
echo "${BACKEND_CONFIG_CONTENT}" >"${SERVER_DIR}/backend.config"
log_info "Created ${SERVER_DIR}/backend.config"

# Web
echo "${BACKEND_CONFIG_CONTENT}" >"${WEB_DIR}/backend.config"
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
