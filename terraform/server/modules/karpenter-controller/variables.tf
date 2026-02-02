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

# Cluster variables

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_endpoint" {
  description = "Endpoint of the EKS cluster"
  type        = string
}

# Instead of reusing the existing node role, could also create a new one.
# See https://karpenter.sh/docs/reference/cloudformation/#node-authorization
variable "node_iam_role_name" {
  description = "Name of the IAM role for EKS nodes (used by Karpenter to launch nodes)"
  type        = string
}

# Karpenter Helm chart variables

variable "chart_version" {
  description = "Version of the Karpenter Helm chart"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace where Karpenter controller is deployed (kube-system or karpenter)"
  type        = string
}
