output "certificate_arn" {
  description = "ARN of the validated ACM certificate for the API endpoint"
  value       = aws_acm_certificate_validation.api_endpoint.certificate_arn
}
