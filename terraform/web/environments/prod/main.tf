module "github_actions_oidc" {
  source = "../../../modules/github-actions-oidc"

  app_name    = var.app_name
  environment = var.environment
  aws_region  = var.aws_region

  role_name            = "${var.app_name}-github-actions-web-${var.environment}"
  github_org           = var.github_org
  github_repo          = var.github_repo
  create_oidc_provider = true
  iam_role_policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          module.web_hosting.s3_bucket_arn,
          "${module.web_hosting.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = module.web_hosting.cloudfront_distribution_arn
      }
    ]
  })
}

module "web_hosting" {
  source = "../../modules/web-hosting"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  environment = var.environment
  app_name    = var.app_name
  aws_region  = var.aws_region

  domain_name = var.domain_name
}
