resource "helm_release" "argocd" {
  name             = "argo-cd"
  repository       = var.chart_path != null ? null : "https://argoproj.github.io/argo-helm"
  chart            = var.chart_path != null ? var.chart_path : "argo-cd"
  version          = var.chart_path != null ? null : var.chart_version
  namespace        = "argocd"
  create_namespace = true

  values = [
    yamlencode({
      global = {
        # All Argo CD components need to tolerate the managed node group taint to run during
        # bootstrap, before Karpenter-provisioned nodes exist.
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      configs = {
        params = {
          # Disable TLS on the Argo CD server; TLS is terminated at the ALB.
          "server.insecure" = "true"
        }
      }
      server = {
        ingress = {
          enabled          = true
          ingressClassName = "alb"
          annotations = {
            "alb.ingress.kubernetes.io/scheme"             = "internet-facing"
            "alb.ingress.kubernetes.io/target-type"        = "ip"
            "alb.ingress.kubernetes.io/listen-ports"       = "[{\"HTTP\":80},{\"HTTPS\":443}]"
            "alb.ingress.kubernetes.io/ssl-redirect"       = "443"
            "alb.ingress.kubernetes.io/certificate-arn"    = var.acm_certificate_arn
            "alb.ingress.kubernetes.io/healthcheck-path"   = "/healthz"
            "alb.ingress.kubernetes.io/load-balancer-name" = "${var.app_name}-argocd-lb-${var.environment}"
            "alb.ingress.kubernetes.io/tags"               = "app=${var.app_name},environment=${var.environment}"
            "external-dns.alpha.kubernetes.io/hostname"    = var.hostname
          }
          hosts = [var.hostname]
        }
      }
    })
  ]
}
