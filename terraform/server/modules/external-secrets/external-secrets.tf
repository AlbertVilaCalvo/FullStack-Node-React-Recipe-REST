locals {
  service_account_name = "external-secrets"
  namespace            = "external-secrets"
}

resource "helm_release" "external_secrets" {
  depends_on = [
    aws_eks_pod_identity_association.external_secrets,
    aws_iam_role_policy_attachment.external_secrets
  ]

  name             = "external-secrets"
  repository       = var.chart_path != null ? null : "https://charts.external-secrets.io"
  chart            = var.chart_path != null ? var.chart_path : "external-secrets"
  version          = var.chart_path != null ? null : var.chart_version
  namespace        = local.namespace
  create_namespace = true

  values = [
    yamlencode({
      serviceAccount = {
        create = true
        name   = local.service_account_name
      }
      # Allow scheduling on the bootstrap nodes of the managed node group.
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
      webhook = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      certController = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
    })
  ]
}
