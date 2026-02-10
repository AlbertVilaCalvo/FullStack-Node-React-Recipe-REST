output "state_bucket" {
  value       = module.terraform_state.bucket_name
  description = "Name of the S3 bucket for prod environment Terraform state"
}

output "environment" {
  value       = var.environment
  description = "The deployment environment (dev, prod)"
}
