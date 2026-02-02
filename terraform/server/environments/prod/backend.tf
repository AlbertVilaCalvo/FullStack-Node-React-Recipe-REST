terraform {
  backend "s3" {
    bucket       = "recipe-manager-terraform-state-prod"
    key          = "server/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
