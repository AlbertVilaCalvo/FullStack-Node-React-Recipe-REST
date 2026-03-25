output "argocd_url" {
  description = "The URL of the Argo CD UI"
  value       = "https://${var.hostname}"
}
