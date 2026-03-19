module "terraform_state" {
  source = "../../modules/terraform-state-s3-bucket"

  app_name    = var.app_name
  environment = var.environment
}

module "github_actions_oidc_provider" {
  create_oidc_provider = var.create_oidc_provider
  source               = "../../modules/github-actions-oidc-provider"
}
