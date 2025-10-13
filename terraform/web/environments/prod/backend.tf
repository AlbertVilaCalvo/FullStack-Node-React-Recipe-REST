terraform {
  backend "s3" {
    bucket         = "recipe-manager-terraform-state-prod"
    key            = "web-hosting/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "recipe-manager-terraform-locks-prod"
  }
}
