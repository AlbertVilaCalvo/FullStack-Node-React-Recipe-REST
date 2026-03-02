resource "aws_secretsmanager_secret" "email_user" {
  name                    = "${var.app_name}-email-user-${var.environment}"
  description             = "Email user for ${var.app_name} in ${var.environment} environment"
  recovery_window_in_days = var.secretsmanager_secret_recovery_days
}

resource "aws_secretsmanager_secret_version" "email_user" {
  secret_id        = aws_secretsmanager_secret.email_user.id
  secret_string_wo = var.email_user
  # Increment this value when an update to the email user is required
  secret_string_wo_version = 1
}

resource "aws_secretsmanager_secret" "email_password" {
  name                    = "${var.app_name}-email-password-${var.environment}"
  description             = "Email password for ${var.app_name} in ${var.environment} environment"
  recovery_window_in_days = var.secretsmanager_secret_recovery_days
}

resource "aws_secretsmanager_secret_version" "email_password" {
  secret_id        = aws_secretsmanager_secret.email_password.id
  secret_string_wo = var.email_password
  # Increment this value when an update to the email password is required
  secret_string_wo_version = 1
}
