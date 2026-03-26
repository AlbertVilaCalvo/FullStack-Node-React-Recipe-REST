# Argo CD installs an Ingress resource to expose its UI. The Ingress requires:
#   - AWS Load Balancer Controller to provision the ALB
#   - ExternalDNS to create the Route53 A record
# Therefore, the root module must apply this module after those controllers exist.
#
# The root Application (App of Apps pattern) is embedded in the Helm chart's extraObjects.
# Helm installs CRDs before templates, so the Application CRD is available when the root
# Application is created. This keeps bootstrap fully declarative in Terraform.

locals {
  namespace = "argocd"
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = var.chart_path != null ? null : "oci://ghcr.io/argoproj/argo-helm"
  chart            = var.chart_path != null ? var.chart_path : "argo-cd"
  version          = var.chart_path != null ? null : var.chart_version
  namespace        = local.namespace
  create_namespace = true

  # Wait until the Argo CD control plane is ready before Helm creates the root Application.
  wait = true

  values = [yamlencode({
    global = {
      domain = var.argocd_domain
    }
    configs = {
      params = {
        # TLS terminates at the ALB, which forwards HTTP traffic to the Argo CD server.
        "server.insecure" = true
      }
    }
    dex = {
      enabled = false
    }
    controller = {
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
    redis = {
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    }
    server = {
      ingress = {
        enabled          = true
        ingressClassName = "alb"
        annotations = {
          "alb.ingress.kubernetes.io/certificate-arn"              = var.acm_certificate_arn
          "alb.ingress.kubernetes.io/healthcheck-interval-seconds" = "15"
          "alb.ingress.kubernetes.io/healthcheck-path"             = "/healthz"
          "alb.ingress.kubernetes.io/healthcheck-timeout-seconds"  = "5"
          "alb.ingress.kubernetes.io/healthy-threshold-count"      = "2"
          "alb.ingress.kubernetes.io/listen-ports"                 = jsonencode([{ HTTP = 80 }, { HTTPS = 443 }])
          "alb.ingress.kubernetes.io/load-balancer-name"           = "${var.app_name}-argocd-lb-${var.environment}"
          "alb.ingress.kubernetes.io/scheme"                       = "internet-facing"
          "alb.ingress.kubernetes.io/ssl-redirect"                 = "443"
          "alb.ingress.kubernetes.io/tags"                         = "app=${var.app_name},environment=${var.environment}"
          "alb.ingress.kubernetes.io/target-type"                  = "ip"
          "alb.ingress.kubernetes.io/unhealthy-threshold-count"    = "3"
          "external-dns.alpha.kubernetes.io/hostname"              = var.argocd_domain
        }
        tls = false
      }
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    }
    extraObjects = [{
      apiVersion = "argoproj.io/v1alpha1"
      kind       = "Application"
      metadata = {
        name       = "root"
        namespace  = local.namespace
        finalizers = ["resources-finalizer.argocd.argoproj.io"]
      }
      spec = {
        project = "default"
        source = {
          path           = "kubernetes/argocd-apps/${var.environment}"
          repoURL        = var.git_repo_url
          targetRevision = var.git_revision
        }
        destination = {
          namespace = local.namespace
          server    = "https://kubernetes.default.svc"
        }
        syncPolicy = {
          automated = {
            prune    = true
            selfHeal = true
          }
        }
      }
    }]
  })]
}
