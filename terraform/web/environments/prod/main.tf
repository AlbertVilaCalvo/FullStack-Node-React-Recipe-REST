module "github_oidc_role_web" {
  source = "../../../modules/github-oidc-role"

  app_name         = var.app_name
  environment      = var.environment
  role_name_suffix = "web-deploy"
  github_org       = var.github_org
  github_repo      = var.github_repo
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [module.web_hosting.s3_bucket_arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
        Resource = ["${module.web_hosting.s3_bucket_arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = [module.web_hosting.cloudfront_distribution_arn]
      },
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
