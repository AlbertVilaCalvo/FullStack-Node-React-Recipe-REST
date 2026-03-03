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

# External Secrets Operator module variables

variable "chart_version" {
  description = "Version of the External Secrets Operator Helm chart"
  type        = string
}

variable "use_local_chart" {
  description = "Whether to install the Helm chart from a local archive path instead of the remote repository"
  type        = bool
}

variable "local_chart_path" {
  description = "Absolute path to a local Helm chart archive (.tgz). Used only when use_local_chart is true"
  type        = string
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "secrets_manager_secret_arns" {
  description = "List of AWS Secrets Manager secret ARNs that the External Secrets Operator is allowed to access"
  type        = list(string)
}
