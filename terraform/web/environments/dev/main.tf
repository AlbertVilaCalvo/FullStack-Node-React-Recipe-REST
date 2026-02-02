module "github_actions_oidc" {
  source = "../../modules/github-actions-oidc"

  environment = var.environment
  app_name    = var.app_name
  aws_region  = var.aws_region

  github_org                          = var.github_org
  github_repo                         = var.github_repo
  website_s3_bucket_arn               = module.web_hosting.s3_bucket_arn
  website_cloudfront_distribution_arn = module.web_hosting.cloudfront_distribution_arn
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
