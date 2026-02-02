variable "environment" {
  description = "The deployment environment (dev, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|prod)$", var.environment))
    error_message = "The environment must be one of: dev, prod."
  }
}

variable "app_name" {
  description = "The application name"
  type        = string
}

variable "aws_region" {
  description = "The AWS region to deploy the resources to"
  type        = string
  validation {
    condition     = can(regex("^(us|eu|ap|sa|ca|me|af)-(east|west|north|south|central|northeast|southeast|northwest|southwest)-[1-3]$", var.aws_region))
    error_message = "The region must be a valid AWS region (e.g., us-east-1, eu-west-2)."
  }
}

variable "additional_default_tags" {
  description = "Additional default tags, in addition to Application and Environment"
  type        = map(string)
  default     = {}
  validation {
    condition     = length([for k in keys(var.additional_default_tags) : k if k == "Application" || k == "Environment"]) == 0
    error_message = "additional_default_tags must not contain the keys \"Application\" or \"Environment\" as they are already set"
  }
}

# GitHub Actions OIDC

variable "github_org" {
  description = "The GitHub organization name for the repository using OIDC authentication"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9_-]+$", var.github_org))
    error_message = "The GitHub organization name must contain only alphanumeric characters, underscores, and hyphens."
  }
}

variable "github_repo" {
  description = "The GitHub repository name for the repository using OIDC authentication"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9._-]+$", var.github_repo))
    error_message = "The GitHub repository name must contain only alphanumeric characters, underscores, hyphens, and periods."
  }
}

# Web hosting

variable "domain_name" {
  description = "The domain name for the web hosting"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9.-]+$", var.domain_name))
    error_message = "The domain name must contain only alphanumeric characters, periods, and hyphens."
  }
}
