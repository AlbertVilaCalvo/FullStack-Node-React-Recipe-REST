# There is also aws_secretsmanager_random_password we could use:
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/ephemeral-resources/secretsmanager_random_password

ephemeral "random_password" "master_password" {
  length = 32
  # Special characters can cause issues when replacing REPLACE_WITH_RDS_PASSWORD with sed
  special = false
}

resource "aws_secretsmanager_secret" "master_password" {
  name                    = "${var.app_name}-rds-master-password-${var.environment}"
  description             = "RDS PostgreSQL master password for ${var.app_name} in ${var.environment} environment"
  recovery_window_in_days = var.master_password_recovery_days
}

resource "aws_secretsmanager_secret_version" "master_password" {
  secret_id        = aws_secretsmanager_secret.master_password.id
  secret_string_wo = ephemeral.random_password.master_password.result
  # Terraform stores the aws_db_instance's password_wo_version argument value in state and can
  # track if it changes. Increment this value when an update to the master password is required
  secret_string_wo_version = 1
}
