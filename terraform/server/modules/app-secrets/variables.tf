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

# App Secrets module variables

variable "secretsmanager_secret_recovery_days" {
  description = "Number of days to retain secrets in Secrets Manager after deletion (e.g., 7 for dev, 30 for prod). Use 0 if you recreate infrastructure to avoid 'InvalidRequestException: you can't create this secret because a secret with this name is already scheduled for deletion'."
  type        = number
}
