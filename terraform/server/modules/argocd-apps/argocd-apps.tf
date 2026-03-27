# Root Application (App of Apps pattern).
# Points to a directory in the Git repository that contains Argo CD Application manifests.
#
# The Argo CD CRDs must be installed before this module is applied.
# Use depends_on = [module.argocd] in the root module to enforce this ordering.

resource "kubernetes_manifest" "root_application" {
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = "root"
      namespace = "argocd"
      finalizers = [
        "resources-finalizer.argocd.argoproj.io"
      ]
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
