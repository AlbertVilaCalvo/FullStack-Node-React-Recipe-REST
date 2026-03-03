locals {
  service_account_name = "external-secrets"
  namespace            = "external-secrets"
  local_chart_enabled  = var.use_local_chart && trimspace(var.local_chart_path) != ""
  chart_reference      = local.local_chart_enabled ? var.local_chart_path : "external-secrets"
  chart_repository     = local.local_chart_enabled ? null : "https://charts.external-secrets.io"
  chart_version        = local.local_chart_enabled ? null : var.chart_version
}

resource "helm_release" "external_secrets" {
  depends_on = [
    aws_eks_pod_identity_association.external_secrets,
    aws_iam_role_policy_attachment.external_secrets
  ]

  name             = "external-secrets"
  repository       = local.chart_repository
  chart            = local.chart_reference
  version          = local.chart_version
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
