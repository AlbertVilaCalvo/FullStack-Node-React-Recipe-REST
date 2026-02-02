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
      Environment = var.environment
    })
  }
}

# Provider for ACM certificate (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = merge(var.additional_default_tags, {
      Application = var.app_name
      Environment = var.environment
    })
  }
}
