variable "environment" {
  description = "The deployment environment (dev, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|prod)$", var.environment))
    error_message = "The environment must be one of: dev, prod."
  }
}

variable "github_repo_url" {
  description = "HTTPS URL of the GitHub repository (e.g., https://github.com/org/repo.git)"
  type        = string
}
