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
  description = "Version of the Argo CD Helm chart (argo-cd)"
  type        = string
}

variable "argocd_domain" {
  description = "The domain name for the Argo CD UI (e.g., argocd.recipemanager.link)"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for the Argo CD ALB HTTPS listener"
  type        = string
}
