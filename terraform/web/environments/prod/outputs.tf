output "website_s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.web_hosting.s3_bucket_name
}

output "website_cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.web_hosting.cloudfront_distribution_id
}

output "website_url" {
  description = "Website URL"
  value       = module.web_hosting.website_url
}
