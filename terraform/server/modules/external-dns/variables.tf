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

variable "managed_endpoints" {
  description = "List of endpoint domain names that ExternalDNS will manage DNS records for (e.g., [\"api.recipemanager.link\", \"argocd.recipemanager.link\"])"
  type        = list(string)
  validation {
    condition     = length(var.managed_endpoints) > 0
    error_message = "At least one managed endpoint must be specified."
  }
  validation {
    condition     = alltrue([for ep in var.managed_endpoints : can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", ep))])
    error_message = "All managed endpoints must be valid domain names."
  }
}
