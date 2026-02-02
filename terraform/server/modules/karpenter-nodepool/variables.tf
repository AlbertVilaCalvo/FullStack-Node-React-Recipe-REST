# Cluster variables

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "node_iam_role_name" {
  description = "Name of the IAM role for EKS nodes (used by Karpenter to launch nodes)"
  type        = string
}

# NodePool configuration

# If you use spot and on-demand, you need at least 5 instance types, otherwise you get this error:
#   failed while checking on-demand fallback
#   at least 5 instance types are recommended when flexible to spot but requesting on-demand, the current provisioning request only has 2 instance type options
# AWS recommends 10, see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html#be-instance-type-flexible
variable "instance_types" {
  description = "List of EC2 instance types for the NodePool"
  type        = list(string)
}

variable "capacity_types" {
  description = "List of capacity types (on-demand, spot)"
  type        = list(string)
  validation {
    condition     = alltrue([for ct in var.capacity_types : contains(["on-demand", "spot"], ct)])
    error_message = "capacity_types must only contain on-demand or spot"
  }
}

variable "cpu_limit" {
  description = "Maximum CPU cores that can be provisioned by Karpenter"
  type        = number
}

variable "memory_limit" {
  description = "Maximum memory that can be provisioned by Karpenter (e.g., 100Gi)"
  type        = string
}

variable "consolidate_after" {
  description = "Time after which to consolidate underutilized nodes"
  type        = string
}
