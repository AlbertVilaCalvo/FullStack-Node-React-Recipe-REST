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

# Pod Identity module variables

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for the service account"
  type        = string
}

variable "service_account_name" {
  description = "Name of the Kubernetes service account"
  type        = string
}

variable "secrets_manager_secret_rds_credentials_arn" {
  description = "The ARN of the Secrets Manager secret containing RDS credentials"
  type        = string
}

variable "enable_s3_access" {
  description = "Enable S3 access for file uploads"
  type        = bool
  default     = false
}

variable "s3_bucket_arn" {
  description = "The ARN of the S3 bucket for file uploads (required if enable_s3_access is true)"
  type        = string
  default     = ""
}
