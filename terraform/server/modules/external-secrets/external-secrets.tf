resource "helm_release" "external_secrets" {
  depends_on = [
    aws_eks_pod_identity_association.external_secrets,
    aws_iam_role_policy_attachment.external_secrets,
  ]

  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = var.chart_version
  namespace        = local.namespace
  create_namespace = true

  values = [
    yamlencode({
      # Allow scheduling on the managed node group bootstrap nodes.
      # The managed node group nodes have a NoSchedule taint for karpenter.sh/controller,
      # so ESO needs this toleration to be able to run before Karpenter provisions app nodes.
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    })
  ]
}
