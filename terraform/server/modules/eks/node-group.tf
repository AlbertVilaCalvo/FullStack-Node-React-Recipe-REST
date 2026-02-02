# EKS Managed Node Group
resource "aws_eks_node_group" "main" {
  # Ensure that IAM Role permissions are created before and deleted after EKS Node Group handling.
  # Otherwise, EKS will not be able to properly delete EC2 Instances and Elastic Network Interfaces.
  depends_on = [
    aws_iam_role_policy_attachment.node_group_worker_policy,
    aws_iam_role_policy_attachment.node_group_cni_policy,
    aws_iam_role_policy_attachment.node_group_ecr_policy,
    aws_iam_role_policy_attachment.node_group_ssm_policy,
  ]

  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.app_name}-eks-node-group-${var.environment}"
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = var.private_node_subnet_ids
  version         = var.kubernetes_version

  instance_types = var.node_instance_types
  capacity_type  = var.node_capacity_type
  # https://docs.aws.amazon.com/eks/latest/APIReference/API_Nodegroup.html#API_Nodegroup_Contents
  # https://repost.aws/questions/QU5-aVwCeCQT6paofciywPXA/difference-between-eks-ami-and-bottle-rocket
  # ami_type       = "AL2_x86_64"

  launch_template {
    id      = aws_launch_template.node_group.id
    version = aws_launch_template.node_group.latest_version
  }

  scaling_config {
    min_size     = var.node_group_min_size
    max_size     = var.node_group_max_size
    desired_size = var.node_group_desired_size
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    Application = var.app_name
    Environment = var.environment
    # Ensure Karpenter runs on nodes that it does not manage (i.e. the managed node group nodes)
    # https://github.com/terraform-aws-modules/terraform-aws-eks/blob/42693d40bceb3ad80d49b0574cc3046455c2def6/examples/karpenter/main.tf#L89-L92
    "karpenter.sh/controller" = "true"
  }

  # The pods that do not tolerate this taint should run on nodes created by Karpenter
  # https://aws-ia.github.io/terraform-aws-eks-blueprints/patterns/karpenter-mng/#cluster
  taint {
    key    = "karpenter.sh/controller"
    value  = "true"
    effect = "NO_SCHEDULE"
  }
}

# We need a Launch Template to attach the node security group (defined in security-groups.tf)
# to the managed node group (MNG) nodes, otherwise the MNG nodes will use the cluster SG, but
# the Karpenter nodes will use the node SG. When this happens, Karpenter nodes are not able to
# communicate with the MNG nodes because the node SG has a self-referencing rule for node-to-node
# communication. This causes DNS resolution errors at the Karpenter pods, since CoreDNS runs on
# the MNG nodes (see addons.tf). For example, we get "Error: getaddrinfo EAI_AGAIN" when the app
# tries to connect to the RDS database.
resource "aws_launch_template" "node_group" {
  name_prefix            = "${var.app_name}-eks-node-group-lt-${var.environment}-"
  update_default_version = true

  vpc_security_group_ids = [aws_security_group.node.id]

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size = var.node_disk_size
      volume_type = "gp3"
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.app_name}-eks-node-group-node-${var.environment}"
      Application = var.app_name
      Environment = var.environment
    }
  }
}
