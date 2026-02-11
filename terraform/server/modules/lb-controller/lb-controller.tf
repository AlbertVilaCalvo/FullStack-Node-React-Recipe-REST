locals {
  service_account_name = "aws-load-balancer-controller"
  namespace            = "kube-system"
}

resource "helm_release" "aws_load_balancer_controller" {
  depends_on = [
    aws_eks_pod_identity_association.lb_controller,
    aws_iam_role_policy_attachment.lb_controller
  ]

  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = var.chart_version
  namespace  = local.namespace

  values = [
    yamlencode({
      clusterName = var.cluster_name
      serviceAccount = {
        create = true
        name   = local.service_account_name
      }
      region = var.aws_region
      vpcId  = var.vpc_id
      # Allow scheduling on the bootstrap nodes of the managed node group.
      # Note we don't set nodeSelector here like we do for the Karpenter
      # controller (see karpenter-controller.tf) to allow the Load Balancer Controller
      # to run on any node, including Karpenter-provisioned nodes once they exist.
      # We only need to tolerate the managed node group nodes, not force the LBC to run
      # only on the managed node group nodes.
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    })
  ]
}
