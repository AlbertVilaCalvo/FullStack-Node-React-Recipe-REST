#!/bin/bash
#
# Common utilities for Recipe Manager shell scripts
#
# This file provides shared functions and variables used across multiple scripts
# in the Recipe Manager project. It should be sourced, not executed directly.
#
# Usage:
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   # shellcheck source=/dev/null
#   source "${SCRIPT_DIR}/../lib/common.sh"
#
# Available utilities:
#   - Color variables: RED, GREEN, YELLOW, BLUE, NC
#   - Logging functions: log_info, log_warn, log_error, log_step
#   - Terraform helpers: get_terraform_output, get_tfvars_value
#   - Validation helpers: validate_environment, validate_command_exists, validate_directory_exists, validate_file_exists
#   - Retry logic: retry_with_backoff
#   - Constants: SECTION_SEP

set -euo pipefail

# ============================================================================
# Color Definitions
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Constants
# ============================================================================

# Section separator for decorative output (exported for use in scripts)
export SECTION_SEP="============================================================================"

# ============================================================================
# Logging Functions
# ============================================================================

# Print an informational message in green
# Arguments:
#   $1 - Message to print
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

# Print a warning message in yellow
# Arguments:
#   $1 - Message to print
log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Print an error message in red
# Arguments:
#   $1 - Message to print
log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Print a step message in blue
# Arguments:
#   $1 - Message to print
log_step() {
  echo -e "${BLUE}[STEP]${NC} $1"
}

# ============================================================================
# Terraform Helper Functions
# ============================================================================

# Get a Terraform output value
# Arguments:
#   $1 - Output name
# Returns:
#   The raw output value
# Note:
#   Requires TERRAFORM_DIR to be set in the calling script
get_terraform_output() {
  local output_name="$1"
  terraform -chdir="${TERRAFORM_DIR}" output -raw "${output_name}"
}

# Get a value from terraform.tfvars file
# Arguments:
#   $1 - Key name
# Returns:
#   The value (extracted from between quotes)
# Note:
#   Requires TERRAFORM_DIR to be set in the calling script
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
# Validation Helper Functions
# ============================================================================

# Validate that the environment is either 'dev' or 'prod'
# Arguments:
#   $1 - Environment name
# Exits:
#   1 if environment is invalid
validate_environment() {
  local environment="$1"
  if [[ "${environment}" != "dev" && "${environment}" != "prod" ]]; then
    log_error "Invalid environment: ${environment}. Must be 'dev' or 'prod'."
    exit 1
  fi
}

# Validate that a command exists and is executable
# Arguments:
#   $1 - Command name
# Exits:
#   1 if command not found
validate_command_exists() {
  local command_name="$1"
  if ! command -v "${command_name}" &>/dev/null; then
    log_error "${command_name} is not installed. Please install it and try again."
    exit 1
  fi
}

# Validate that a directory exists
# Arguments:
#   $1 - Directory path
#   $2 - Optional custom error message
# Exits:
#   1 if directory not found
validate_directory_exists() {
  local dir_path="$1"
  local custom_message="${2:-}"

  if [[ ! -d "${dir_path}" ]]; then
    if [[ -n "${custom_message}" ]]; then
      log_error "${custom_message}"
    else
      log_error "Directory not found: ${dir_path}"
    fi
    exit 1
  fi
}

# Validate that a file exists
# Arguments:
#   $1 - File path
#   $2 - Optional custom error message
# Exits:
#   1 if file not found
validate_file_exists() {
  local file_path="$1"
  local custom_message="${2:-}"

  if [[ ! -f "${file_path}" ]]; then
    if [[ -n "${custom_message}" ]]; then
      log_error "${custom_message}"
    else
      log_error "File not found: ${file_path}"
    fi
    exit 1
  fi
}

# ============================================================================
# Retry Logic
# ============================================================================

# Retry a command with exponential backoff
# Arguments:
#   $1 - Maximum number of retries
#   $2 - Success message to display on success
#   $3 - Operation name (for error messages)
#   $4+ - Command to execute (all remaining arguments)
# Returns:
#   0 on success, exits with 1 on failure after max retries
# Example:
#   retry_with_backoff 3 "Operation succeeded" "performing operation" terraform apply -auto-approve
retry_with_backoff() {
  local max_retries="$1"
  local success_msg="$2"
  local operation_name="$3"
  shift 3
  local command=("$@")

  local retry_count=0
  while [ $retry_count -lt "$max_retries" ]; do
    if "${command[@]}"; then
      log_info "${success_msg}"
      return 0
    else
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt "$max_retries" ]; then
        log_warn "${operation_name} failed (attempt $retry_count/$max_retries). Retrying in 10 seconds..."
        sleep 10
      else
        log_error "Failed to ${operation_name} after $max_retries attempts"
        exit 1
      fi
    fi
  done
}

# ============================================================================
# Helm Chart Download Helper Functions
# ============================================================================

# Download a Helm chart archive to a local directory
# Arguments:
#   $1 - Chart reference (e.g., aws-load-balancer-controller or oci://public.ecr.aws/karpenter/karpenter)
#   $2 - Chart version
#   $3 - Destination directory
#   $4 - Optional chart repository URL for non-OCI charts
# Returns:
#   0 on success, exits with 1 on failure
download_helm_chart() {
  local chart_ref="$1"
  local chart_version="$2"
  local destination_dir="$3"
  local repository_url="${4:-}"

  local chart_name
  chart_name="$(basename "${chart_ref}")"
  local chart_archive_path="${destination_dir}/${chart_name}-${chart_version}.tgz"

  mkdir -p "${destination_dir}"

  if [[ -f "${chart_archive_path}" ]]; then
    log_info "Using cached chart archive: ${chart_archive_path}"
    return 0
  fi

  log_info "Downloading Helm chart ${chart_name} ${chart_version}..."
  if [[ -n "${repository_url}" ]]; then
    helm pull "${chart_ref}" --repo "${repository_url}" --version "${chart_version}" --destination "${destination_dir}"
  else
    helm pull "${chart_ref}" --version "${chart_version}" --destination "${destination_dir}"
  fi

  validate_file_exists "${chart_archive_path}" "Failed to download Helm chart archive: ${chart_archive_path}"
}

# Download all server Helm charts locally and export Terraform variables to use local charts
# Requires:
#   TERRAFORM_DIR to be set in the calling script
# Exports:
#   HELM_CHARTS_DIR
#   TF_VAR_use_local_helm_charts
#   TF_VAR_lb_controller_local_chart_path
#   TF_VAR_external_dns_local_chart_path
#   TF_VAR_external_secrets_local_chart_path
#   TF_VAR_karpenter_local_chart_path
download_helm_charts() {
  local charts_dir="${TERRAFORM_DIR}/.helm-charts"

  local lb_controller_chart_version
  local external_dns_chart_version
  local external_secrets_chart_version
  local karpenter_chart_version

  lb_controller_chart_version="$(get_tfvars_value "lb_controller_chart_version")"
  external_dns_chart_version="$(get_tfvars_value "external_dns_chart_version")"
  external_secrets_chart_version="$(get_tfvars_value "external_secrets_chart_version")"
  karpenter_chart_version="$(get_tfvars_value "karpenter_chart_version")"

  if [[ -z "${lb_controller_chart_version}" || -z "${external_dns_chart_version}" || -z "${external_secrets_chart_version}" || -z "${karpenter_chart_version}" ]]; then
    log_error "Could not read one or more Helm chart versions from terraform.tfvars"
    exit 1
  fi

  log_info "Preparing local Helm chart cache in ${charts_dir}"

  download_helm_chart "aws-load-balancer-controller" "${lb_controller_chart_version}" "${charts_dir}" "https://aws.github.io/eks-charts"
  download_helm_chart "external-dns" "${external_dns_chart_version}" "${charts_dir}" "https://kubernetes-sigs.github.io/external-dns"
  download_helm_chart "external-secrets" "${external_secrets_chart_version}" "${charts_dir}" "https://charts.external-secrets.io"
  download_helm_chart "oci://public.ecr.aws/karpenter/karpenter" "${karpenter_chart_version}" "${charts_dir}"

  export HELM_CHARTS_DIR="${charts_dir}"
  export TF_VAR_use_local_helm_charts=true
  export TF_VAR_lb_controller_local_chart_path="${charts_dir}/aws-load-balancer-controller-${lb_controller_chart_version}.tgz"
  export TF_VAR_external_dns_local_chart_path="${charts_dir}/external-dns-${external_dns_chart_version}.tgz"
  export TF_VAR_external_secrets_local_chart_path="${charts_dir}/external-secrets-${external_secrets_chart_version}.tgz"
  export TF_VAR_karpenter_local_chart_path="${charts_dir}/karpenter-${karpenter_chart_version}.tgz"

  validate_file_exists "${TF_VAR_lb_controller_local_chart_path}"
  validate_file_exists "${TF_VAR_external_dns_local_chart_path}"
  validate_file_exists "${TF_VAR_external_secrets_local_chart_path}"
  validate_file_exists "${TF_VAR_karpenter_local_chart_path}"

  log_info "Local Helm charts are ready and Terraform local-chart variables are configured"
}
