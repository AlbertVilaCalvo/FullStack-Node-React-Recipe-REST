locals {
  cluster_name = "${var.app_name}-eks-${var.environment}"
}

resource "aws_eks_cluster" "main" {
  depends_on = [
    # Ensure that IAM Role permissions are created before and deleted
    # after EKS Cluster handling. Otherwise, EKS will not be able to
    # properly delete EKS managed EC2 infrastructure such as Security Groups.
    aws_iam_role_policy_attachment.cluster_policy,
    # EKS automatically creates the CloudWatch Log Group when enabled_cluster_log_types is set,
    # but when this happens, Terraform does not manage the Log Group, and it remains when you
    # destroy the infrastructure. This is a problem when creating the infrastructure again, since
    # you get this error: "ResourceAlreadyExistsException: The specified log group already exists".
    # What we do here is create the Log Group before the cluster, so that Terraform manages it,
    # and let EKS use it. This way it will be destroyed when the infrastructure is destroyed.
    aws_cloudwatch_log_group.eks
  ]

  name     = local.cluster_name
  version  = var.kubernetes_version
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids = var.private_eni_subnet_ids
    # Security group IDs for the cross-account elastic network interfaces that
    # EKS creates to use to allow communication between your worker nodes and
    # the Kubernetes control plane
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = var.endpoint_public_access
    public_access_cidrs     = var.public_access_cidrs
  }

  access_config {
    authentication_mode                         = "API"
    bootstrap_cluster_creator_admin_permissions = true
  }

  # https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
}

# CloudWatch Log Group for EKS logs

resource "aws_cloudwatch_log_group" "eks" {
  name              = "/aws/eks/${local.cluster_name}/cluster"
  retention_in_days = var.log_retention_days
}
