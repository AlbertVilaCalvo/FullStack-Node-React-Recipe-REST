terraform {
  required_version = "~> 1.14"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.26.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7.2"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = merge(var.additional_default_tags, {
      Application = var.app_name
      Environment = var.environment
    })
  }
}
