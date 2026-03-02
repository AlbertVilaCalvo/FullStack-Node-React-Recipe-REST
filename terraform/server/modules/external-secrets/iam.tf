locals {
  service_account_name = "external-secrets"
  namespace            = "external-secrets"
}

# IAM Role for the External Secrets Operator controller pod
resource "aws_iam_role" "external_secrets" {
  name = "${var.app_name}-eso-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })
}

# Associate the IAM role with the ESO controller service account via EKS Pod Identity.
# The ESO controller pod uses this role to read secrets from AWS Secrets Manager and
# create the corresponding Kubernetes Secrets in the cluster.
resource "aws_eks_pod_identity_association" "external_secrets" {
  cluster_name    = var.cluster_name
  namespace       = local.namespace
  service_account = local.service_account_name
  role_arn        = aws_iam_role.external_secrets.arn

  tags = {
    Name = "${var.app_name}-pod-identity-association-eso-${var.environment}"
  }
}

# Least-privilege policy: only the 4 application secrets are accessible
resource "aws_iam_policy" "external_secrets" {
  name        = "${var.app_name}-eso-policy-${var.environment}"
  description = "Allow External Secrets Operator to read application secrets from Secrets Manager for ${var.app_name} in ${var.environment} environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds",
        ]
        Resource = [
          var.rds_password_secret_arn,
          var.jwt_secret_arn,
          var.email_user_secret_arn,
          var.email_password_secret_arn,
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "external_secrets" {
  role       = aws_iam_role.external_secrets.name
  policy_arn = aws_iam_policy.external_secrets.arn
}
