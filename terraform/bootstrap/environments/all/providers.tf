# Creates the GitHub Actions OIDC identity provider once per AWS account.
# This is a one-time bootstrap step that must be applied before deploying any
# web or server environment. All environments reference the provider via data source:
#
#   data "aws_iam_openid_connect_provider" "github_actions" {
#     url = "https://token.actions.githubusercontent.com"
#   }
#
# Usage:
#   cd terraform/bootstrap/environments/all
#   terraform init
#   terraform apply

terraform {
  required_version = "~> 1.14"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.26.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = merge(var.additional_default_tags, {
      Application = var.app_name
    })
  }
}
