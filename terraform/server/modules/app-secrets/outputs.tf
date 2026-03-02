output "jwt_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing the JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "email_user_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing the email user"
  value       = aws_secretsmanager_secret.email_user.arn
}

output "email_password_secret_arn" {
  description = "The ARN of the Secrets Manager secret containing the email password"
  value       = aws_secretsmanager_secret.email_password.arn
}
