module "terraform_state" {
  source = "../../modules/terraform-state-s3-bucket"

  app_name    = var.app_name
  environment = var.environment
}
