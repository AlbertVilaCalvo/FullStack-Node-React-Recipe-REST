output "db_instance_address" {
  description = "The address (hostname) of the RDS instance (DB_HOST)"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "The port of the RDS instance (DB_PORT)"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "The name of the database (DB_NAME)"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "The master username (DB_USER)"
  value       = aws_db_instance.main.username
}

output "ssm_parameter_arn_rds_address" {
  description = "The ARN of the SSM parameter containing the RDS address (DB_HOST)"
  value       = aws_ssm_parameter.rds_address.arn
}

output "secrets_manager_secret_rds_credentials_arn" {
  description = "The ARN of the Secrets Manager secret containing RDS master password credentials (DB_PASSWORD)"
  value       = aws_secretsmanager_secret.master_password.arn
}
