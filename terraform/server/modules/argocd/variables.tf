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

variable "argocd_domain" {
  description = "The domain name for the Argo CD UI (e.g., argocd.recipemanager.link)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.argocd_domain))
    error_message = "The Argo CD domain must be a valid domain name."
  }
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the Argo CD domain"
  type        = string
}
