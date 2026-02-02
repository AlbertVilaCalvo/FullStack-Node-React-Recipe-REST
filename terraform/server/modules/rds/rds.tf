# Subnets that the RDS instance can be provisioned in
resource "aws_db_subnet_group" "main" {
  name        = "${var.app_name}-rds-subnet-group-${var.environment}"
  description = "RDS subnet group for ${var.app_name} in ${var.environment} environment"
  subnet_ids  = var.subnet_ids
}

resource "aws_db_instance" "main" {
  identifier = "${var.app_name}-postgres-${var.environment}"

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name             = var.database_name
  username            = var.master_username
  password_wo         = ephemeral.random_password.master_password.result
  password_wo_version = aws_secretsmanager_secret_version.master_password.secret_string_wo_version
  port                = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = var.multi_az
  publicly_accessible = false

  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window

  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.app_name}-postgres-final-snapshot-${var.environment}"

  performance_insights_enabled    = true
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"] # Add "iam-db-auth-error" if we start using IAM Authentication
}
