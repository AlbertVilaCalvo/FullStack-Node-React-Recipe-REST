locals {
  namespace = "argocd"
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.chart_version
  namespace        = local.namespace
  create_namespace = true
  wait             = true

  values = [
    yamlencode({
      configs = {
        params = {
          # Disable TLS on the argocd-server since ALB terminates TLS at the edge.
          # This avoids the need to manage certificates inside the pod.
          "server.insecure" = "true"
        }
      }
      server = {
        ingress = {
          enabled          = true
          ingressClassName = "alb"
          hostname         = var.argocd_domain
          annotations = {
            "alb.ingress.kubernetes.io/scheme"                       = "internet-facing"
            "alb.ingress.kubernetes.io/target-type"                  = "ip"
            "alb.ingress.kubernetes.io/listen-ports"                 = jsonencode([{ HTTP = 80 }, { HTTPS = 443 }])
            "alb.ingress.kubernetes.io/ssl-redirect"                 = "443"
            "alb.ingress.kubernetes.io/certificate-arn"              = var.certificate_arn
            "alb.ingress.kubernetes.io/load-balancer-name"           = "${var.app_name}-argocd-lb-${var.environment}"
            "alb.ingress.kubernetes.io/healthcheck-path"             = "/healthz"
            "alb.ingress.kubernetes.io/healthcheck-interval-seconds" = "15"
            "alb.ingress.kubernetes.io/healthcheck-timeout-seconds"  = "5"
            "alb.ingress.kubernetes.io/healthy-threshold-count"      = "2"
            "alb.ingress.kubernetes.io/unhealthy-threshold-count"    = "3"
            "alb.ingress.kubernetes.io/tags"                         = "app=${var.app_name},environment=${var.environment}"
            "external-dns.alpha.kubernetes.io/hostname"              = var.argocd_domain
          }
        }
        # Allow scheduling on the bootstrap nodes of the managed node group.
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      applicationSet = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      controller = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      dex = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      notifications = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      redis = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
      repoServer = {
        tolerations = [{
          key      = "karpenter.sh/controller"
          operator = "Exists"
          effect   = "NoSchedule"
        }]
      }
    })
  ]
}
