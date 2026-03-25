# The root "App of Apps" Application.
# Argo CD watches the kubernetes/argocd-apps/<env>/ directory. Every YAML file added
# to that directory automatically becomes a new Argo CD Application, with no Terraform changes.
resource "kubernetes_manifest" "argocd_apps_root" {
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name       = "argocd-apps"
      namespace  = "argocd"
      finalizers = ["resources-finalizer.argocd.argoproj.io"]
    }
    spec = {
      project = "default"
      source = {
        repoURL        = var.repo_url
        targetRevision = var.target_revision
        path           = "kubernetes/argocd-apps/${var.environment}"
      }
      destination = {
        server    = "https://kubernetes.default.svc"
        namespace = "argocd"
      }
      syncPolicy = {
        automated = {
          prune    = true
          selfHeal = true
        }
      }
    }
  }
}
