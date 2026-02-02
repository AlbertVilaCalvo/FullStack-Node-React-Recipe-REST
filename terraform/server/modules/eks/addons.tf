resource "aws_eks_addon" "vpc_cni" {
  addon_name                  = "vpc-cni"
  cluster_name                = aws_eks_cluster.main.name
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
  # Preserve the addon during cluster destruction to give VPC CNI time to clean up ENIs.
  # Without this, Terraform destroys the addon too early, leaving orphaned ENIs that
  # prevent subnet and security group deletion.
  # See https://github.com/hashicorp/terraform-provider-aws/issues/38887#issuecomment-2321914131
  preserve = true
}

resource "aws_eks_addon" "coredns" {
  addon_name                  = "coredns"
  cluster_name                = aws_eks_cluster.main.name
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
  # Allow CoreDNS to run on the same nodes as the Karpenter controller
  # for use during cluster creation when Karpenter nodes do not yet exist
  configuration_values = jsonencode({
    tolerations = [
      {
        key    = "karpenter.sh/controller"
        value  = "true"
        effect = "NoSchedule"
      }
    ]
  })
}

resource "aws_eks_addon" "kube_proxy" {
  addon_name                  = "kube-proxy"
  cluster_name                = aws_eks_cluster.main.name
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}

resource "aws_eks_addon" "pod_identity_agent" {
  addon_name                  = "eks-pod-identity-agent"
  cluster_name                = aws_eks_cluster.main.name
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}
