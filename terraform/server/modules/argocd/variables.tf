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

# Argo CD module variables

variable "chart_version" {
  description = "Version of the Argo CD Helm chart"
  type        = string
}

variable "chart_path" {
  description = "Local path to the downloaded Helm chart. If provided, disables repository download."
  type        = string
  default     = null
}

variable "hostname" {
  description = "The hostname for the Argo CD UI (e.g., argocd.recipemanager.link)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.hostname))
    error_message = "The hostname must be a valid domain name."
  }
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS termination at the ALB"
  type        = string
  validation {
    condition     = can(regex("^arn:aws:acm:", var.acm_certificate_arn))
    error_message = "The ACM certificate ARN must start with 'arn:aws:acm:'."
  }
}
