ephemeral "random_password" "jwt_secret" {
  length  = 43
  special = false
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.app_name}-jwt-secret-${var.environment}"
  description             = "JWT secret for ${var.app_name} API in ${var.environment} environment"
  recovery_window_in_days = var.secretsmanager_secret_recovery_days
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id        = aws_secretsmanager_secret.jwt_secret.id
  secret_string_wo = ephemeral.random_password.jwt_secret.result
  # Increment this value when rotation of the JWT secret is required
  secret_string_wo_version = 1
}
