# Argo CD installs an Ingress resource to expose its UI. The Ingress requires:
#   - AWS Load Balancer Controller to provision the ALB
#   - ExternalDNS to create the Route53 A record
# Therefore, this module must be applied AFTER module.lb_controller and module.external_dns.
#
# The root Application (App of Apps pattern) is embedded in the Helm chart's extraObjects.
# Helm installs CRDs before templates, so the Application CRD is available when the root
# Application is created. This avoids the need for a separate Terraform module or apply step.

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

  # Wait for all pods to be ready so that the root Application (in extraObjects)
  # is processed by the Argo CD Application controller
  wait = true

  values = [yamlencode({
    global = {
      domain = var.argocd_domain
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
    # Allow scheduling on the bootstrap nodes of the managed node group.
    controller = {
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
        tls = false
      }
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
    # Root Application (App of Apps pattern).
    # Points to a directory in the Git repository that contains Argo CD Application manifests.
    # Adding new applications (e.g., Prometheus, Grafana) only requires a YAML file in Git.
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
          repoURL        = var.git_repo_url
          targetRevision = var.git_revision
          path           = "kubernetes/argocd-apps/${var.environment}"
        }
        destination = {
          server    = "https://kubernetes.default.svc"
          namespace = local.namespace
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
