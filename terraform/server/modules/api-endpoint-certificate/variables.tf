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

variable "api_endpoint" {
  description = "The API endpoint domain name (e.g., api.recipemanager.com)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.api_endpoint))
    error_message = "The API endpoint must be a valid domain name."
  }
}

variable "route53_zone_id" {
  description = "The Route53 hosted zone ID for DNS validation"
  type        = string
}
