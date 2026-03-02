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

# Secret ARNs for the IAM policy (least-privilege: only these 4 secrets are accessible)

variable "rds_password_secret_arn" {
  description = "ARN of the RDS master password secret in Secrets Manager"
  type        = string
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  type        = string
}

variable "email_user_secret_arn" {
  description = "ARN of the email user secret in Secrets Manager"
  type        = string
}

variable "email_password_secret_arn" {
  description = "ARN of the email password secret in Secrets Manager"
  type        = string
}
