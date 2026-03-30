# Argo CD installs an Ingress resource to expose its UI. The Ingress requires:
#   - AWS Load Balancer Controller to provision the ALB
#   - ExternalDNS to create the Route53 A record
# Therefore, this module must be applied AFTER module.lb_controller and module.external_dns.

locals {
  namespace = "argocd"
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "oci://ghcr.io/argoproj/argo-helm"
  chart            = "argo-cd"
  version          = var.chart_version
  namespace        = local.namespace
  create_namespace = true

  wait = true

  values = [yamlencode({
    global = {
      domain = var.argocd_domain
      # Allow scheduling on the managed node group, which has a karpenter.sh/controller taint.
      # This applies to ALL components: dex, redis, redisSecretInit pre-install hook Job, server,
      # repoServer, notifications...
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    }
    configs = {
      params = {
        # Terminate TLS at the ALB, not at the Argo CD server.
        # The ALB handles HTTPS and forwards HTTP traffic to the Argo CD server.
        "server.insecure" = true
      }
    }
    dex = {
      enabled = false
    }
    server = {
      ingress = {
        enabled          = true
        ingressClassName = "alb"
        annotations = {
          "alb.ingress.kubernetes.io/scheme"                       = "internet-facing"
          "alb.ingress.kubernetes.io/target-type"                  = "ip"
          "alb.ingress.kubernetes.io/listen-ports"                 = jsonencode([{ HTTP = 80 }, { HTTPS = 443 }])
          "alb.ingress.kubernetes.io/ssl-redirect"                 = "443"
          "alb.ingress.kubernetes.io/certificate-arn"              = var.acm_certificate_arn
          "alb.ingress.kubernetes.io/healthcheck-path"             = "/api/health"
          "alb.ingress.kubernetes.io/healthcheck-interval-seconds" = "15"
          "alb.ingress.kubernetes.io/healthcheck-timeout-seconds"  = "5"
          "alb.ingress.kubernetes.io/healthy-threshold-count"      = "2"
          "alb.ingress.kubernetes.io/unhealthy-threshold-count"    = "3"
          "alb.ingress.kubernetes.io/load-balancer-name"           = "${var.app_name}-argocd-lb-${var.environment}"
          "alb.ingress.kubernetes.io/tags"                         = "app=${var.app_name},environment=${var.environment}"
          "external-dns.alpha.kubernetes.io/hostname"              = var.argocd_domain
        }
        tls = false
      }
    }
  })]
}
