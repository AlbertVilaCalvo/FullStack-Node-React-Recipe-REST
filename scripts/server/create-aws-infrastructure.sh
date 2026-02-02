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
#   - Valid Route53 zone ID set in terraform.tfvars

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
log_step "Step 1/4: Initializing Terraform..."
terraform init

# Replace REPLACE_WITH_ZONE_ID in terraform.tfvars
log_info "Validating terraform.tfvars configuration..."
if grep -q "REPLACE_WITH_ZONE_ID" terraform.tfvars; then
  log_warn "Route53 Zone ID not configured in terraform.tfvars"

  # Extract api_endpoint from terraform.tfvars
  API_ENDPOINT=$(grep "^api_endpoint" terraform.tfvars | cut -d'"' -f2)

  if [[ -z "${API_ENDPOINT}" ]]; then
    log_error "Could not find api_endpoint in terraform.tfvars"
    exit 1
  fi

  log_info "API endpoint: ${API_ENDPOINT}"

  # Extract root domain (e.g., api.recipemanager.link -> recipemanager.link)
  ROOT_DOMAIN=$(echo "${API_ENDPOINT}" | rev | cut -d. -f1,2 | rev)
  log_info "Looking up Route53 hosted zone for domain: ${ROOT_DOMAIN}"

  # Query Route53 for the zone ID
  ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "${ROOT_DOMAIN}" \
    --query "HostedZones[?Name=='${ROOT_DOMAIN}.'].Id" \
    --output text | sed 's|/hostedzone/||')

  if [[ -z "${ZONE_ID}" ]]; then
    log_error "Could not find Route53 hosted zone for domain: ${ROOT_DOMAIN}"
    log_error "Please ensure the hosted zone exists in AWS Route53"
    log_error ""
    log_error "You can create it using:"
    log_error "  aws route53 create-hosted-zone --name ${ROOT_DOMAIN} --caller-reference $(date +%s)"
    exit 1
  fi

  log_info "Found Route53 Zone ID: ${ZONE_ID}"
  log_info "Updating terraform.tfvars with Route53 Zone ID..."
  sed -i.bak "s/REPLACE_WITH_ZONE_ID/${ZONE_ID}/g" terraform.tfvars
  log_info "terraform.tfvars updated successfully"
fi

# Step 2: Create core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificate, App Secrets)
log_step "Step 2/4: Creating core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificate, App Secrets)..."
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

# Step 3: Install Kubernetes controllers (Load Balancer Controller, Karpenter)
log_step "Step 3/4: Installing Load Balancer Controller and Karpenter..."
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
log_step "Step 4/4: Creating Karpenter NodePool and EC2NodeClass..."
terraform apply -target=module.karpenter_nodepool -auto-approve

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
echo "  3. After deploying the application, create the Route53 A record:"
echo "     cd ${TERRAFORM_DIR}"
echo "     terraform apply -target=module.api_endpoint_dns_record"
echo ""

log_warn "Note: The Route53 A record should only be created AFTER deploying the"
log_warn "Kubernetes manifests, as it depends on the ALB created by the Ingress."
log_warn "The ACM certificate has already been created and validated."
