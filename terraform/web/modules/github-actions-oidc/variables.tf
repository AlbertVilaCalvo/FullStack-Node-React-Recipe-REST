# Common variables

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = can(regex("^(dev|staging|prod)$", var.environment))
    error_message = "The environment must be one of: dev, staging, prod."
  }
}

variable "app_name" {
  description = "The application name"
  type        = string
}

variable "aws_region" {
  description = "The AWS region to deploy the resources to"
  type        = string
  validation {
    condition     = can(regex("^(us|eu|ap|sa|ca|me|af)-(east|west|north|south|central|northeast|southeast|northwest|southwest)-[1-3]$", var.aws_region))
    error_message = "The region must be a valid AWS region (e.g., us-east-1, eu-west-2)."
  }
}

variable "default_tags" {
  description = "Common tags to be applied to all resources"
  type        = map(string)
}

# Module variables

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9-]+$", var.github_org))
    error_message = "GitHub organization must contain only alphanumeric characters and hyphens."
  }
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  validation {
    condition     = can(regex("^[a-zA-Z0-9-_\\.]+$", var.github_repo))
    error_message = "GitHub repository name must contain only alphanumeric characters, hyphens, underscores, and dots."
  }
}

variable "website_s3_bucket_arn" {
  description = "ARN of the S3 bucket that contains the website files"
  type        = string
  validation {
    condition     = can(regex("^arn:aws:s3:::[a-z0-9.-]{3,63}$", var.website_s3_bucket_arn))
    error_message = "The S3 bucket ARN must be a valid ARN (e.g., arn:aws:s3:::my-bucket)."
  }
}

variable "website_cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution of the website"
  type        = string
}
