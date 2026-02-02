# Policy for Secrets Manager access

resource "aws_iam_policy" "secrets_manager" {
  name        = "${var.app_name}-secrets-manager-policy-${var.environment}"
  description = "Allow Secrets Manager access for ${var.app_name} in ${var.environment} environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          var.secrets_manager_secret_rds_credentials_arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "secrets_manager" {
  role       = aws_iam_role.server_pod.name
  policy_arn = aws_iam_policy.secrets_manager.arn
}

# Policy for S3 access (optional, for future file uploads)

resource "aws_iam_policy" "s3_access" {
  count = var.enable_s3_access ? 1 : 0

  name        = "${var.app_name}-s3-access-policy-${var.environment}"
  description = "Allow S3 access for file uploads for ${var.app_name} in ${var.environment} environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  count = var.enable_s3_access ? 1 : 0

  role       = aws_iam_role.server_pod.name
  policy_arn = aws_iam_policy.s3_access[0].arn
}
