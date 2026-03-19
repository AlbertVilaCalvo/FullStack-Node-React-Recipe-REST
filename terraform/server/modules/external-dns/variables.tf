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

variable "hosted_zone_name" {
  description = "The Route53 hosted zone name managed by ExternalDNS (e.g., recipemanager.link or dev.recipemanager.link)"
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", var.hosted_zone_name))
    error_message = "The hosted zone name must be a valid domain name."
  }
}

variable "domains" {
  description = "A list of domain names (e.g., api.recipemanager.link, argocd.recipemanager.link). All domains must belong to the configured hosted zone. Used for domain filtering and IAM restrictions."
  type        = list(string)
  validation {
    condition     = alltrue([for d in var.domains : can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\\.[a-z]{2,}$", d))])
    error_message = "All domains must be valid domain names."
  }
  validation {
    # This module only supports a single Route53 hosted zone.
    condition     = alltrue([for d in var.domains : d == var.hosted_zone_name || endswith(d, ".${var.hosted_zone_name}")])
    error_message = "All domains must be equal to the hosted zone name or be subdomains of it. Multiple hosted zones are not supported."
  }
}
