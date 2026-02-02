output "db_instance_address" {
  description = "The address (hostname) of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "The port of the RDS instance"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "The master username"
  value       = aws_db_instance.main.username
}

output "secrets_manager_secret_rds_credentials_arn" {
  description = "The ARN of the Secrets Manager secret containing RDS master password credentials"
  value       = aws_secretsmanager_secret.master_password.arn
}
