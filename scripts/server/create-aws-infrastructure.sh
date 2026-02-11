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

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/../lib/common.sh"

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1}"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TERRAFORM_DIR="${PROJECT_ROOT}/terraform/server/environments/${ENVIRONMENT}"

# ============================================================================
# Validation
# ============================================================================

# Validate required argument
if [[ -z "${ENVIRONMENT}" ]]; then
  log_error "Environment is required."
  log_error "Usage: ./scripts/server/create-aws-infrastructure.sh <environment>"
  log_error "Example: ./scripts/server/create-aws-infrastructure.sh dev"
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

# Check if Helm is installed
validate_command_exists helm

# Check if kubectl is installed
validate_command_exists kubectl

# ============================================================================
# Main Script
# ============================================================================

log_info "Creating AWS infrastructure for environment: ${ENVIRONMENT}"
echo ""

cd "${TERRAFORM_DIR}"

# Step 1: Initialize Terraform
log_step "Step 1/5: Initializing Terraform..."
validate_file_exists "${TERRAFORM_DIR}/backend.config" "backend.config not found at ${TERRAFORM_DIR}/backend.config. Please run scripts/bootstrap/create-state-bucket.sh ${ENVIRONMENT} first to create the state bucket and backend.config file."

log_info "Using backend config from backend.config"
terraform init -backend-config="backend.config"

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
retry_with_backoff 3 "Kubernetes controllers installed successfully" "install Kubernetes controllers" \
  terraform apply \
  -target=module.lb_controller \
  -target=module.external_dns \
  -target=module.karpenter_controller \
  -auto-approve

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
