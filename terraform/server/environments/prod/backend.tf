terraform {
  backend "s3" {
    key          = "server/terraform.tfstate"
    use_lockfile = true
    encrypt      = true
  }
}
