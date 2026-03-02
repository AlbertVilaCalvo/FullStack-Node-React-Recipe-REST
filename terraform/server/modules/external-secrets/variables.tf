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

variable "aws_region" {
  description = "The AWS region to deploy the resources to"
  type        = string
  validation {
    condition     = can(regex("^(us|eu|ap|sa|ca|me|af)-(east|west|north|south|central|northeast|southeast|northwest|southwest)-[1-3]$", var.aws_region))
    error_message = "The region must be a valid AWS region (e.g., us-east-1, eu-west-2)."
  }
}

# External Secrets Operator module variables

variable "chart_version" {
  description = "Version of the External Secrets Operator Helm chart"
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
