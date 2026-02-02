data "aws_caller_identity" "current" {}

locals {
  service_account_name = "karpenter"
  account_id           = data.aws_caller_identity.current.account_id
}

resource "helm_release" "karpenter" {
  depends_on = [
    aws_eks_pod_identity_association.karpenter,
    aws_iam_role_policy_attachment.karpenter_controller
  ]

  name       = "karpenter"
  repository = "oci://public.ecr.aws/karpenter"
  chart      = "karpenter"
  version    = var.chart_version
  namespace  = var.namespace

  values = [yamlencode({
    serviceAccount = {
      create = true
      name   = local.service_account_name
    }
    settings = {
      clusterName       = var.cluster_name
      clusterEndpoint   = var.cluster_endpoint
      interruptionQueue = aws_sqs_queue.karpenter.name
    }
    # Run Karpenter Controller on the managed node group nodes. See eks/node-group.tf.
    # https://aws-ia.github.io/terraform-aws-eks-blueprints/patterns/karpenter-mng/#karpenter-resources
    nodeSelector = {
      "karpenter.sh/controller" = "true"
    }
    tolerations = [{
      key      = "karpenter.sh/controller"
      operator = "Exists"
      effect   = "NoSchedule"
    }]
  })]

  # Wait for the CRDs to be available
  wait = true
}
