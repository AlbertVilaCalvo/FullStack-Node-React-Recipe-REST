variable "environment" {
  description = "The deployment environment (dev, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|prod)$", var.environment))
    error_message = "The environment must be one of: dev, prod."
  }
}

variable "git_repo_url" {
  description = "URL of the Git repository containing Argo CD Application manifests (e.g., https://github.com/org/repo.git)"
  type        = string
}

variable "git_revision" {
  description = "Git revision (branch, tag, commit or 'HEAD') to sync from"
  type        = string
}
