output "oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC identity provider"
  value       = module.github_actions_oidc_provider.oidc_provider_arn
}
