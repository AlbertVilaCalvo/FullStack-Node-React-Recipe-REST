locals {
  environment = "prod"
  app_name    = "recipe-manager"
}

module "web_hosting" {
  source = "../../modules/web-hosting"

  aws_region  = "us-east-1"
  app_name    = local.app_name
  environment = local.environment
  default_tags = {
    Application = local.app_name
    Environment = local.environment
  }
  domain_name = "recipemanager.link"
}
