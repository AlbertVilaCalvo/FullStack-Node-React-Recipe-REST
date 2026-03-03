data "aws_caller_identity" "current" {}

locals {
  service_account_name = "karpenter"
  namespace            = "karpenter"
  account_id           = data.aws_caller_identity.current.account_id
  local_chart_enabled  = var.use_local_chart && trimspace(var.local_chart_path) != ""
  chart_reference      = local.local_chart_enabled ? var.local_chart_path : "karpenter"
  chart_repository     = local.local_chart_enabled ? null : "oci://public.ecr.aws/karpenter"
  chart_version        = local.local_chart_enabled ? null : var.chart_version
}

resource "helm_release" "karpenter" {
  depends_on = [
    aws_eks_pod_identity_association.karpenter_controller,
    aws_iam_role_policy_attachment.karpenter_controller
  ]

  name             = "karpenter"
  repository       = local.chart_repository
  chart            = local.chart_reference
  version          = local.chart_version
  namespace        = local.namespace
  create_namespace = true

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
