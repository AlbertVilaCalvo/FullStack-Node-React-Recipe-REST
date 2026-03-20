data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name = "${var.app_name}-github-actions-${var.role_name_suffix}-role-${var.environment}"
  # Trust policy allowing GitHub Actions (the trusted entity) to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github_actions.arn
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
  name   = "${var.app_name}-github-actions-${var.role_name_suffix}-policy-${var.environment}"
  role   = aws_iam_role.github_actions.id
  policy = var.role_policy_json
}
