output "oidc_role_arn" {
  description = "ARN of the IAM role for OIDC authentication with GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}
