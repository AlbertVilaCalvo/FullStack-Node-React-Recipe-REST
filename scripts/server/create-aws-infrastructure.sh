#!/bin/bash
#
# Create AWS infrastructure for the Recipe Manager server
#
# Usage:
#   ./scripts/server/create-aws-infrastructure.sh <environment>
#
# Usage examples:
#   ./scripts/server/create-aws-infrastructure.sh dev    # Create dev infrastructure
#   ./scripts/server/create-aws-infrastructure.sh prod   # Create prod infrastructure
#
# Arguments:
#   environment - The deployment environment (dev or prod)
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Terraform installed
#   - Helm installed
#   - kubectl installed
#   - Route53 hosted zone for the API domain exists in AWS

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
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

# Validate required arguments
if [[ -z "${ENVIRONMENT}" ]]; then
  log_error "Environment is required."
  log_error "Usage: ./scripts/server/create-aws-infrastructure.sh <environment>"
  log_error "Example: ./scripts/server/create-aws-infrastructure.sh dev"
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

# Check if Helm is installed
if ! command -v helm &>/dev/null; then
  log_error "Helm is not installed. Please install it and try again."
  exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &>/dev/null; then
  log_error "kubectl is not installed. Please install it and try again."
  exit 1
fi

# ============================================================================
# Main Script
# ============================================================================

log_info "Creating AWS infrastructure for environment: ${ENVIRONMENT}"
echo ""

cd "${TERRAFORM_DIR}"

# Step 1: Initialize Terraform
log_step "Step 1/5: Initializing Terraform..."
terraform init

# Step 2: Create core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificate, App Secrets)
log_step "Step 2/5: Creating core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificate, App Secrets)..."
log_info "This may take 15-20 minutes..."
terraform apply \
  -target=module.vpc \
  -target=module.eks \
  -target=module.rds \
  -target=module.ecr \
  -target=module.pod_identity \
  -target=module.api_endpoint_certificate \
  -target=module.app_secrets \
  -auto-approve

# Step 3: Install Kubernetes controllers (Load Balancer Controller, ExternalDNS, Karpenter) using Helm
log_step "Step 3/5: Installing Load Balancer Controller, ExternalDNS and Karpenter Helm charts..."
log_info "This may take 5-10 minutes..."

# Retry logic for network timeouts when downloading Helm charts
# │ Error: Error locating chart
# │
# │ with module.lb_controller.helm_release.aws_load_balancer_controller,
# │ on ../../modules/lb-controller/lb-controller.tf line 6, in resource "helm_release" "aws_load_balancer_controller":
# │ 6: resource "helm_release" "aws_load_balancer_controller" {
# │
# │ Unable to locate chart aws-load-balancer-controller: Get "https://aws.github.io/eks-charts/aws-load-balancer-controller-1.17.1.tgz": read tcp 192.168.1.59:51924->185.199.110.153:443: read: operation timed out
MAX_RETRIES=3
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if terraform apply \
    -target=module.lb_controller \
    -target=module.external_dns \
    -target=module.karpenter_controller \
    -auto-approve; then
    log_info "Kubernetes controllers installed successfully"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      log_warn "Installation failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 10 seconds..."
      sleep 10
    else
      log_error "Failed to install Kubernetes controllers after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

# Step 4: Create Karpenter NodePool and EC2NodeClass
# The Karpenter CRDs need to be installed before creating the NodePool and EC2NodeClass
log_step "Step 4/5: Creating Karpenter NodePool and EC2NodeClass..."
terraform apply -target=module.karpenter_nodepool -auto-approve

# Step 5: Update kubectl config
log_step "Step 5/5: Updating kubectl configuration..."
AWS_REGION=$(get_tfvars_value "aws_region")
CLUSTER_NAME=$(get_terraform_output "cluster_name")
if [[ -n "${AWS_REGION}" && -n "${CLUSTER_NAME}" ]]; then
  aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"
else
  log_warn "Could not get aws_region from terraform.tfvars or cluster_name from Terraform outputs."
  log_info "You can manually update your kubeconfig with the following command:"
  log_info "aws eks update-kubeconfig --region <aws_region> --name <cluster_name>"
fi

# Display summary
echo ""
echo "=========================================="
echo "Infrastructure Creation Complete!"
echo "=========================================="
echo ""

log_info "Infrastructure summary:"
terraform output

echo ""
log_info "Next steps:"
echo ""
echo "  1. Build and push the Docker image to ECR:"
echo "     ./scripts/server/build-push-image-ecr.sh ${ENVIRONMENT}"
echo ""
echo "  2. Deploy the server application (apply Kubernetes manifests):"
echo "     ./scripts/server/deploy-server-eks.sh ${ENVIRONMENT} <image_tag>"
echo ""
