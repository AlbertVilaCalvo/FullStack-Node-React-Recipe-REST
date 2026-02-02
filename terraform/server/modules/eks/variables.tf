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

# EKS module variables

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+$", var.kubernetes_version))
    error_message = "kubernetes_version must be in format X.Y (e.g., 1.34)"
  }
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_eni_subnet_ids" {
  description = "List of private subnet IDs for EKS control plane ENIs"
  type        = list(string)
  validation {
    condition     = length(var.private_eni_subnet_ids) >= 2
    error_message = "At least 2 private subnets are required for EKS control plane ENIs"
  }
}

variable "private_node_subnet_ids" {
  description = "List of private subnet IDs for worker nodes"
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Enable public access to the EKS API endpoint"
  type        = bool
}

variable "public_access_cidrs" {
  description = "List of CIDR blocks allowed to access the EKS API endpoint publicly"
  type        = list(string)
}

variable "node_instance_types" {
  description = "List of EC2 instance types for the managed node group"
  type        = list(string)
  validation {
    condition     = length(var.node_instance_types) > 0
    error_message = "At least one instance type must be specified (e.g., [\"t3.medium\"])"
  }
}

variable "node_group_min_size" {
  description = "Minimum number of nodes in the node group"
  type        = number
  validation {
    condition     = var.node_group_min_size >= 1 && var.node_group_min_size <= 10
    error_message = "node_group_min_size must be between 1 and 10"
  }
}

variable "node_group_max_size" {
  description = "Maximum number of nodes in the node group"
  type        = number
  validation {
    condition     = var.node_group_max_size >= 1 && var.node_group_max_size <= 10
    error_message = "node_group_max_size must be between 1 and 10"
  }
}

variable "node_group_desired_size" {
  description = "Desired number of nodes in the node group"
  type        = number
  validation {
    condition     = var.node_group_desired_size >= 1 && var.node_group_desired_size <= 10
    error_message = "node_group_desired_size must be between 1 and 10"
  }
}

variable "node_disk_size" {
  description = "Disk size in GB for worker nodes"
  type        = number
}

variable "node_capacity_type" {
  description = "Capacity type for the node group (ON_DEMAND for prod, and SPOT or ON_DEMAND for dev/staging)"
  type        = string
  validation {
    condition = (
      var.environment == "prod" ? var.node_capacity_type == "ON_DEMAND"
      : contains(["ON_DEMAND", "SPOT"], var.node_capacity_type)
    )
    error_message = "If environment is prod, node_capacity_type must be ON_DEMAND; otherwise it must be ON_DEMAND or SPOT."
  }
}

variable "log_retention_days" {
  description = "Retention period in days for the CloudWatch Log Group (e.g. 10 for dev, 30 for prod)"
  type        = number
  validation {
    condition     = contains([0, 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653], var.log_retention_days)
    error_message = "log_retention_days must be one of: 0, 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653"
  }
}
