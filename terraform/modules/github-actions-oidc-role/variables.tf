# Common variables

variable "app_name" {
  description = "The application name"
  type        = string
}

variable "environment" {
  description = "The deployment environment (dev, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|prod)$", var.environment))
    error_message = "The environment must be one of: dev, prod."
  }
}

# Module variables

variable "github_org" {
  description = "The GitHub organization or username that owns the repository"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9_-]+$", var.github_org))
    error_message = "The GitHub organization name must contain only alphanumeric characters, underscores, and hyphens."
  }
}

variable "github_repo" {
  description = "The GitHub repository name"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9._-]+$", var.github_repo))
    error_message = "The GitHub repository name must contain only alphanumeric characters, underscores, hyphens, and periods."
  }
}

variable "role_name_suffix" {
  description = "Suffix appended to the IAM role name to distinguish it from other GitHub Actions roles (e.g., 'web-deploy', 'server-ecr-push')"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.role_name_suffix))
    error_message = "role_name_suffix must contain only lowercase letters, digits, and hyphens."
  }
}

variable "role_policy_json" {
  description = "JSON-encoded IAM policy document granting the permissions for the GitHub Actions workflow"
  type        = string
}
