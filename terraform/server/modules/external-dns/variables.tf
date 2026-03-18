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

# ExternalDNS module variables

variable "chart_version" {
  description = "Version of the ExternalDNS Helm chart"
  type        = string
}

variable "chart_path" {
  description = "Local path to the downloaded Helm chart. If provided, disables repository download."
  type        = string
  default     = null
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "endpoints" {
  description = "A list of endpoint domain names (e.g., api.recipemanager.link, argocd.recipemanager.link). All endpoints must belong to the same root hosted zone. Used for domain filtering."
  type        = list(string)
  validation {
    condition     = alltrue([for e in var.endpoints : can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", e))])
    error_message = "All endpoints must be valid domain names."
  }
  validation {
    # Extract the root domain (last two components) from each endpoint and assert they're all the same.
    # This module only supports a single Route53 hosted zone.
    condition = length(distinct([
      for e in var.endpoints : join(".", slice(split(".", e), length(split(".", e)) - 2, length(split(".", e))))
    ])) == 1
    error_message = "All endpoints must belong to the same root domain (e.g., all under recipemanager.link). Multiple hosted zones are not supported."
  }
}
