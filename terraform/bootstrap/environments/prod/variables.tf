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

variable "additional_default_tags" {
  description = "Additional default tags, in addition to Application and Environment"
  type        = map(string)
  default     = {}
  validation {
    condition     = length([for k in keys(var.additional_default_tags) : k if k == "Application" || k == "Environment"]) == 0
    error_message = "additional_default_tags must not contain the keys \"Application\" or \"Environment\" as they are already set"
  }
}
