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

ENVIRONMENT="${1:-}"
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

validate_environment "${ENVIRONMENT}"

validate_directory_exists "${TERRAFORM_DIR}"

validate_command_exists terraform
validate_command_exists aws
validate_command_exists kubectl

# ============================================================================
# Main Script
# ============================================================================

log_info "Creating AWS infrastructure for environment: ${ENVIRONMENT}"
echo ""

cd "${TERRAFORM_DIR}" || exit 1

# Step 1: Initialize Terraform
log_step "Step 1/4: Initializing Terraform..."
validate_file_exists "${TERRAFORM_DIR}/backend.config" "backend.config not found at ${TERRAFORM_DIR}/backend.config. Please run scripts/bootstrap/create-state-bucket.sh ${ENVIRONMENT} first to create the state bucket and backend.config file."

log_info "Using backend config from backend.config"
terraform init -backend-config="backend.config"

# Step 2: Create core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificates, App
# Secrets, External Secrets Operator IAM role, GitHub Actions OIDC role).
# External Secrets Operator Helm chart is managed by Argo CD (GitOps), but the IAM role and
# Pod Identity Association are created here since they depend on Terraform-managed AWS resources.
log_step "Step 2/4: Creating core infrastructure (VPC, EKS, RDS, ECR, Pod Identity, ACM Certificates, App Secrets, ESO IAM, GitHub Actions OIDC role)..."
log_info "This may take 15-20 minutes..."
terraform apply \
  -target=module.vpc \
  -target=module.eks \
  -target=module.rds \
  -target=module.ecr \
  -target=module.pod_identity \
  -target=module.acm_certificates \
  -target=module.app_secrets \
  -target=module.external_secrets \
  -target=module.github_actions_oidc_role_server \
  -auto-approve

# Step 3: Install Helm charts (Load Balancer Controller, ExternalDNS, Karpenter, Argo CD).
# External Secrets Operator Helm chart is managed by Argo CD, so it is not installed here.
# Argo CD depends on LBC (for ALB) and ExternalDNS (for DNS record), hence the ordering.
log_step "Step 3/4: Installing Load Balancer Controller, ExternalDNS, Karpenter and Argo CD Helm charts..."
log_info "This may take 5-10 minutes..."

# Download Helm charts locally to avoid network timeouts during Terraform apply
download_helm_charts

# Retry logic for network timeouts when downloading Helm charts
retry_with_backoff 3 "Install Kubernetes controllers" \
  terraform apply \
  -target=module.lb_controller \
  -target=module.external_dns \
  -target=module.karpenter_controller \
  -target=module.argocd \
  -auto-approve

# Step 4: Create the Argo CD bootstrap Application.
# The Argo CD Application CRDs must be installed (step 3) before this can succeed.
# This Application watches kubernetes/argocd-apps/${ENVIRONMENT} in Git and auto-syncs:
#   - External Secrets Operator Helm chart
#   - Karpenter NodePool + EC2NodeClass
#   - recipe-manager server Kubernetes manifests
log_step "Step 4/4: Creating Argo CD bootstrap Application (triggers GitOps sync)..."
terraform apply -target=module.argocd_apps -auto-approve

# Update kubectl config
log_info "Updating kubectl configuration..."
AWS_REGION=$(get_tfvars_value "aws_region")
CLUSTER_NAME=$(get_terraform_output "cluster_name")
aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"

# Display summary
echo ""
echo "=========================================="
echo "Infrastructure Creation Complete!"
echo "=========================================="
echo ""

log_info "Infrastructure summary:"
terraform output

echo ""
log_info "Argo CD is syncing the following from Git (kubernetes/argocd-apps/${ENVIRONMENT}):"
echo "  - External Secrets Operator (Helm chart)"
echo "  - Karpenter NodePool + EC2NodeClass"
echo "  - recipe-manager server application"
echo ""
log_info "Argo CD UI: https://$(get_tfvars_value "argocd_domain")"
log_info "Initial admin password:"
echo "  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
