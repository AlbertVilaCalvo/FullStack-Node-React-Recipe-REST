output "aws_region" {
  description = "The AWS region where resources are deployed"
  value       = module.web_hosting.aws_region
}

output "oidc_role_arn" {
  description = "ARN of the IAM role for OIDC authentication with GitHub Actions"
  value       = module.github_actions_oidc.oidc_role_arn
}

output "website_s3_bucket_name" {
  description = "Name of the S3 bucket that contains the website files"
  value       = module.web_hosting.s3_bucket_name
}

output "website_cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution for the website"
  value       = module.web_hosting.cloudfront_distribution_id
}

output "website_url" {
  description = "Website URL"
  value       = module.web_hosting.website_url
}
