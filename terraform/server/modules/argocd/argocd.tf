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
        controller       = "aws"
        ingressClassName = "alb"
        annotations = {
          "alb.ingress.kubernetes.io/scheme"                       = "internet-facing"
          "alb.ingress.kubernetes.io/target-type"                  = "ip"
          "alb.ingress.kubernetes.io/listen-ports"                 = jsonencode([{ HTTP = 80 }, { HTTPS = 443 }])
          "alb.ingress.kubernetes.io/ssl-redirect"                 = "443"
          "alb.ingress.kubernetes.io/certificate-arn"              = var.acm_certificate_arn
          "alb.ingress.kubernetes.io/healthcheck-path"             = "/healthz"
          "alb.ingress.kubernetes.io/healthcheck-interval-seconds" = "15"
          "alb.ingress.kubernetes.io/healthcheck-timeout-seconds"  = "5"
          "alb.ingress.kubernetes.io/healthy-threshold-count"      = "2"
          "alb.ingress.kubernetes.io/unhealthy-threshold-count"    = "3"
          "alb.ingress.kubernetes.io/load-balancer-name"           = "${var.app_name}-argocd-lb-${var.environment}"
          "alb.ingress.kubernetes.io/tags"                         = "app=${var.app_name},environment=${var.environment}"
          "external-dns.alpha.kubernetes.io/hostname"              = var.argocd_domain
        }
        # Create a second service for argocd-server as explained at
        # https://argo-cd.readthedocs.io/en/stable/operator-manual/ingress/#aws-application-load-balancers-albs-and-classic-elb-http-mode
        # The chart creates a separate gRPC Service (argocd-server-grpc) with an
        # alb.ingress.kubernetes.io/backend-protocol-version: GRPC annotation, and adds
        # the following condition annotation to the Ingress to route application/grpc
        # traffic to it:
        #   alb.ingress.kubernetes.io/conditions.argocd-server-grpc:
        #   [{"field":"http-header","httpHeaderConfig":{"httpHeaderName": "Content-Type", "values":["application/grpc"]}}]
        # Without this, you get the following error when running `argocd` CLI commands:
        #   {"level":"warning",
        #    "msg":"Failed to invoke grpc call. Use flag --grpc-web in grpc calls. To avoid this warning message, use flag --grpc-web.",
        #    "time":"2026-03-27T13:42:29+01:00"}
        aws = {
          serviceType            = "ClusterIP"
          backendProtocolVersion = "GRPC"
        }
      }
    }
  })]
}
