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
