#!/bin/bash
#
# Delete AWS infrastructure for the Recipe Manager server
#
# Usage:
#   ./scripts/server/delete-aws-infrastructure.sh <environment>
#
# Usage examples:
#   ./scripts/server/delete-aws-infrastructure.sh dev    # Delete dev infrastructure
#   ./scripts/server/delete-aws-infrastructure.sh prod   # Delete prod infrastructure
#
# Arguments:
#   environment - The deployment environment (dev or prod)
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Terraform installed
#   - Helm installed
#   - kubectl installed
#   - Docker installed and running (optional, for cleaning up local images)
#
# WARNING: This will permanently delete all infrastructure resources, including the ECR images!

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
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
  terraform -chdir="${TERRAFORM_DIR}" output -raw "${output_name}" 2>/dev/null || echo ""
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
  log_error "Usage: ./scripts/server/delete-aws-infrastructure.sh <environment>"
  log_error "Example: ./scripts/server/delete-aws-infrastructure.sh dev"
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

log_warn "WARNING: This will permanently delete ALL infrastructure for environment: ${ENVIRONMENT}"
log_warn "This includes: VPC, EKS cluster, RDS database, ECR repository, and all associated resources."
echo ""
read -p "Are you sure you want to continue? Type 'yes' to proceed: " -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
  log_info "Deletion cancelled."
  exit 0
fi

log_info "Starting infrastructure deletion for environment: ${ENVIRONMENT}"
echo ""

cd "${TERRAFORM_DIR}"

# Initialize Terraform
log_info "Initializing Terraform..."
terraform init

CLUSTER_NAME=$(get_terraform_output "cluster_name")
if [[ -z "${CLUSTER_NAME}" ]]; then
  log_error "Could not get cluster_name from Terraform outputs."
  log_error "Make sure you have run 'terraform apply' in ${TERRAFORM_DIR}"
  exit 1
fi
ECR_REPOSITORY_URL=$(get_terraform_output "ecr_repository_url")
if [[ -z "${ECR_REPOSITORY_URL}" ]]; then
  log_error "Could not get ecr_repository_url from Terraform outputs."
  log_error "Make sure you have run 'terraform apply' in ${TERRAFORM_DIR}"
  exit 1
fi
API_ENDPOINT=$(get_tfvars_value "api_endpoint")
if [[ -z "${API_ENDPOINT}" ]]; then
  log_warn "Could not get api_endpoint from terraform.tfvars."
  exit 1
fi
AWS_REGION=$(get_tfvars_value "aws_region")
if [[ -z "${AWS_REGION}" ]]; then
  log_error "Could not get aws_region from terraform.tfvars."
  exit 1
fi
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [[ -z "${AWS_ACCOUNT_ID}" ]]; then
  log_error "Could not get AWS account ID from AWS CLI."
  exit 1
fi

log_info "Cluster Name: ${CLUSTER_NAME}"
log_info "ECR Repository URL: ${ECR_REPOSITORY_URL}"
log_info "API Endpoint: ${API_ENDPOINT}"
log_info "AWS Region: ${AWS_REGION}"

# Extract root domain (e.g., api.recipemanager.link -> recipemanager.link)
ROOT_DOMAIN=$(echo "${API_ENDPOINT}" | rev | cut -d. -f1,2 | rev)
log_info "Root Domain: ${ROOT_DOMAIN}"
# Query Route53 for the zone ID
log_info "Looking up Route53 hosted zone ID for domain: ${ROOT_DOMAIN}"
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name "${ROOT_DOMAIN}" \
  --query "HostedZones[?Name=='${ROOT_DOMAIN}.'].Id" \
  --output text | sed 's|/hostedzone/||')
if [[ -z "${ZONE_ID}" ]]; then
  log_error "Could not get Zone ID for ${ROOT_DOMAIN}. Check if the Hosted Zone exists."
  exit 1
fi
log_info "Hosted Zone ID: ${ZONE_ID}"

# Step 1: Delete Kubernetes resources (required to remove ALB created by Ingress)
log_step "Step 1/7 : Deleting Kubernetes resources..."

# Configure kubectl, delete all resources in the namespace and wait for the Load Balancer Controller to clean up AWS resources (ALB, Target Groups, Security Groups)
if aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}" 2>/dev/null; then
  log_info "Deleting Kubernetes resources in namespace ${NAMESPACE}..."
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found=true --timeout=300s || log_warn "Could not delete namespace (may not exist)"

  log_info "Waiting for AWS Load Balancer Controller to clean up AWS resources..."
  log_info "Checking for resources tagged with 'elbv2.k8s.aws/cluster: ${CLUSTER_NAME}'..."

  WAIT_TIMEOUT=600
  START_TIME=$(date +%s)

  while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))

    if [ $ELAPSED -gt $WAIT_TIMEOUT ]; then
      log_warn "Timeout ($WAIT_TIMEOUT seconds) waiting for AWS resources cleanup. Proceeding anyway..."
      break
    fi

    # Check for Load Balancers, Target Groups, and Security Groups managed by the Load Balancer Controller
    REMAINING_ALB_RESOURCES=$(aws resourcegroupstaggingapi get-resources \
      --region "${AWS_REGION}" \
      --tag-filters "Key=elbv2.k8s.aws/cluster,Values=${CLUSTER_NAME}" \
      --resource-type-filters "elasticloadbalancing:loadbalancer" "elasticloadbalancing:targetgroup" "ec2:security-group" \
      --query 'ResourceTagMappingList[*].ResourceARN' \
      --output text)

    # Check for DNS A record
    # There is also a TXT record created by ExternalDNS for ownership tracking, but we only check for the A record which points to the ALB
    REMAINING_DNS_RECORD=$(aws route53 list-resource-record-sets \
      --hosted-zone-id "${ZONE_ID}" \
      --query "ResourceRecordSets[?Name=='${API_ENDPOINT}.' && Type=='A'].Name" \
      --output text)

    if [[ -z "${REMAINING_ALB_RESOURCES}" && -z "${REMAINING_DNS_RECORD}" ]]; then
      log_info "All Load Balancer resources and DNS records have been successfully deleted."
      break
    fi

    if [[ -n "${REMAINING_DNS_RECORD}" ]]; then
      log_info "DNS A Record for ${API_ENDPOINT} still exists..."
    fi
    if [[ -n "${REMAINING_ALB_RESOURCES}" ]]; then
      log_info "Load Balancer resources still remaining..."
    fi

    log_info "Checking again in 10s (Elapsed: ${ELAPSED}s)"
    sleep 10
  done
else
  log_error "Could not connect to EKS cluster"
  log_error "Make sure the cluster is up and you have the correct AWS credentials configured"
  log_error "Then run this script again"
  exit 1
fi

# Step 2: Delete Karpenter NodePool
log_step "Step 2/7 : Deleting Karpenter NodePool and EC2NodeClass..."
terraform destroy -target=module.karpenter_nodepool -auto-approve

# Step 3: Delete Kubernetes controllers (Karpenter, Load Balancer Controller) Helm charts
log_step "Step 3/7 : Deleting Kubernetes controllers (Load Balancer Controller, ExternalDNS, Karpenter) Helm charts..."

# Retry logic for network timeouts when downloading Helm charts
MAX_RETRIES=3
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if terraform destroy \
    -target=module.karpenter_controller \
    -target=module.external_dns \
    -target=module.lb_controller \
    -auto-approve; then
    log_info "Kubernetes controllers deleted successfully"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      log_warn "Deletion failed (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 10 seconds..."
      sleep 10
    else
      log_error "Failed to delete Kubernetes controllers after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

# Step 4: Delete all remaining resources
log_step "Step 4/7 : Deleting all remaining resources (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificate, App Secrets)..."
log_info "This may take 15-20 minutes..."

terraform destroy \
  -target=module.vpc \
  -target=module.eks \
  -target=module.rds \
  -target=module.ecr \
  -target=module.pod_identity \
  -target=module.api_endpoint_certificate \
  -target=module.app_secrets \
  -auto-approve

log_info "Remaining resources deleted successfully"

# Step 5: Cleanup local Docker images
log_step "Step 5/7 : Cleaning up local Docker images..."

# Check if Docker is available
if command -v docker &>/dev/null && docker info >/dev/null 2>&1; then
  # Remove <account-id>.dkr.ecr.us-east-1.amazonaws.com/recipe-manager-server-dev:2026-01-29-12h56m33s
  log_info "Removing Docker images tagged with ECR repository URL..."
  ECR_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${ECR_REPOSITORY_URL}" || true)
  if [[ -n "${ECR_IMAGES}" ]]; then
    echo "${ECR_IMAGES}" | xargs -r docker rmi -f 2>/dev/null || log_warn "Some ECR images could not be removed"
    log_info "ECR-tagged images removed."
  else
    log_info "No ECR-tagged images found."
  fi

  # Remove recipe-manager-server:2026-01-29-12h56m33s
  log_info "Removing recipe-manager-server images with timestamp tags..."
  # Only match images with timestamp pattern (YYYY-MM-DD-HHhMMmSSs) to avoid deleting docker-compose images
  SERVER_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "recipe-manager-server:[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-" || true)
  if [[ -n "${SERVER_IMAGES}" ]]; then
    echo "${SERVER_IMAGES}" | xargs -r docker rmi -f 2>/dev/null || log_warn "Some server images could not be removed"
    log_info "Server images removed."
  else
    log_info "No recipe-manager-server images with timestamp tags found."
  fi
else
  log_warn "Docker is not available. Skipping Docker image cleanup."
fi

# Step 6: Cleanup Terraform state
log_step "Step 6/7 : Cleaning up Terraform state files..."
rm -rf .terraform terraform.tfstate*
log_info "Terraform state files removed."

# Step 7: Cleanup ~/.kube/config
log_step "Step 7/7 : Removing kubeconfig context, cluster and user entries..."
CLUSTER_ARN="arn:aws:eks:${AWS_REGION}:${AWS_ACCOUNT_ID}:cluster/${CLUSTER_NAME}"
kubectl config delete-context "${CLUSTER_ARN}" || true
kubectl config delete-cluster "${CLUSTER_ARN}" || true
kubectl config delete-user "${CLUSTER_ARN}" || true
log_info "Removed kubeconfig entries for ${CLUSTER_ARN} (if present)."

# Display summary
echo ""
echo "=========================================="
echo "Infrastructure Deletion Complete!"
echo "=========================================="
echo ""


log_info "All AWS infrastructure for environment '${ENVIRONMENT}' has been deleted."
log_info "Terraform state has been completely removed."
echo ""
