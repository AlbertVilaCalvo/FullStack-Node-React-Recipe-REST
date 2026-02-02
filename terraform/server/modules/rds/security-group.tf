resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg-${var.environment}"
  description = "Security group for RDS PostgreSQL for ${var.app_name} in ${var.environment} environment"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "rds_eks_access" {
  count = length(var.allowed_security_group_ids)

  security_group_id = aws_security_group.rds.id
  description       = "Allow PostgreSQL access from EKS nodes"

  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.allowed_security_group_ids[count.index]
}
