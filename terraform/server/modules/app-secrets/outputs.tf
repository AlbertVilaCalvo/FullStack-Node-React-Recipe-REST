output "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "email_user_secret_arn" {
  description = "ARN of the email user secret in Secrets Manager"
  value       = aws_secretsmanager_secret.email_user.arn
}

output "email_password_secret_arn" {
  description = "ARN of the email password secret in Secrets Manager"
  value       = aws_secretsmanager_secret.email_password.arn
}
