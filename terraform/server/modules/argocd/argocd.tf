terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
    }
  }
}

variable "domain_name" {
  type        = string
  description = "Domain name for Argo CD ingress"
}

variable "chart_version" {
  type        = string
  description = "Helm chart version"
}

variable "chart_path" {
  type        = string
  description = "Path to the local Helm chart"
  default     = null
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = var.chart_path != null ? null : "https://argoproj.github.io/argo-helm"
  chart            = var.chart_path != null ? var.chart_path : "argo-cd"
  version          = var.chart_path != null ? null : var.chart_version
  namespace        = "argocd"
  create_namespace = true

  set {
    name  = "server.ingress.enabled"
    value = "true"
  }
  set {
    name  = "server.ingress.ingressClassName"
    value = "alb"
  }
  set {
    name  = "server.ingress.hosts[0]"
    value = var.domain_name
  }
  set {
    name  = "server.ingress.annotations.alb\\.ingress\\.kubernetes\\.io/scheme"
    value = "internet-facing"
  }
  set {
    name  = "server.ingress.annotations.alb\\.ingress\\.kubernetes\\.io/target-type"
    value = "ip"
  }
  set {
    name  = "server.ingress.annotations.alb\\.ingress\\.kubernetes\\.io/listen-ports"
    value = "[{\"HTTPS\":443}]"
  }
  set {
    name  = "server.ingress.annotations.alb\\.ingress\\.kubernetes\\.io/backend-protocol"
    value = "HTTP"
  }
}
