variable "environment" {
  description = "The deployment environment (dev, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|prod)$", var.environment))
    error_message = "The environment must be one of: dev, prod."
  }
}

variable "repo_url" {
  description = "The Git repository URL for Argo CD to sync (e.g., https://github.com/org/repo.git)"
  type        = string
}

variable "target_revision" {
  description = "Git branch, tag, or commit SHA for Argo CD to sync"
  type        = string
  default     = "HEAD"
}
