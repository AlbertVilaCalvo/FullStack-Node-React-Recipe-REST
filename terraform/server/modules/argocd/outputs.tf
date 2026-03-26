output "initial_admin_secret_name" {
  description = "Name of the secret containing the initial Argo CD admin password"
  value       = "argocd-initial-admin-secret"
}

output "namespace" {
  description = "Namespace where Argo CD is installed"
  value       = local.namespace
}
