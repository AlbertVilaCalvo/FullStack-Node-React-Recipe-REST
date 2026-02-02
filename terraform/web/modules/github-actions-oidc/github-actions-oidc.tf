# Data source for the GitHub OIDC provider thumbprint
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = [
    "sts.amazonaws.com"
  ]
  thumbprint_list = [
    # From https://github.blog/changelog/2023-06-27-github-actions-update-on-oidc-integration-with-aws/
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
    # Keep the dynamic lookup as a fallback
    data.tls_certificate.github.certificates[0].sha1_fingerprint
  ]
}

resource "aws_iam_role" "github_actions" {
  name = "${var.app_name}-github-actions-oidc-role-${var.environment}"
  # Trust policy allowing GitHub Actions (the trusted entity) to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

# Inline permissions policy for the GitHub Actions role
resource "aws_iam_role_policy" "github_actions" {
  name = "${var.app_name}-github-actions-oidc-policy-${var.environment}"
  role = aws_iam_role.github_actions.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          var.website_s3_bucket_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${var.website_s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          var.website_cloudfront_distribution_arn
        ]
      }
    ]
  })
}
