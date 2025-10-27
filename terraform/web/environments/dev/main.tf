module "github_actions_oidc" {
  source = "../../modules/github-actions-oidc"

  environment = var.environment
  app_name    = var.app_name
  aws_region  = var.aws_region
  default_tags = {
    Application = var.app_name
    Environment = var.environment
  }

  github_org                          = var.github_org
  github_repo                         = var.github_repo
  website_s3_bucket_arn               = module.web_hosting.s3_bucket_arn
  website_cloudfront_distribution_arn = module.web_hosting.cloudfront_distribution_arn
}

module "web_hosting" {
  source = "../../modules/web-hosting"

  environment = var.environment
  app_name    = var.app_name
  aws_region  = var.aws_region
  default_tags = {
    Application = var.app_name
    Environment = var.environment
  }

  domain_name = var.domain_name
}
