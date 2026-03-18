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

# ACM Certificate module variables

variable "endpoint" {
  description = "The endpoint domain name to create an ACM certificate for (e.g., api.recipemanager.link, argocd.recipemanager.link)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.endpoint))
    error_message = "The endpoint must be a valid domain name."
  }
}

variable "endpoint_name" {
  description = "A short name for the endpoint, used in resource names and tags (e.g., api-endpoint, argocd)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.endpoint_name))
    error_message = "The endpoint name must contain only lowercase alphanumeric characters and hyphens."
  }
}
