terraform {
  backend "s3" {
    key          = "web/terraform.tfstate"
    use_lockfile = true
    encrypt      = true
  }
}
