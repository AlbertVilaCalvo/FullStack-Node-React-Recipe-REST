# We could store the RDS endpoint (DB_HOST) in the configmap.yaml like we do with DB_USER,
# DB_PORT and DB_NAME, but that would require us to update the ConfigMap every time we
# destroy and recreate the infrastructure, since the RDS instance changes.
# We store the RDS endpoint address in SSM Parameter Store instead of Secrets Manager
# because it is not sensitive and it is a static value that does not require rotation.
# SSM Parameter Store is free for standard parameters (Secrets Manager costs $0.40 per
# secret per month).
resource "aws_ssm_parameter" "rds_address" {
  name        = "/${var.app_name}/${var.environment}/rds-address"
  description = "The database endpoint address (DB_HOST)"
  type        = "String"
  value       = aws_db_instance.main.address
}
