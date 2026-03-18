output "certificate_arn" {
  description = "ARN of the validated ACM certificate for the endpoint"
  value       = aws_acm_certificate_validation.endpoint.certificate_arn
}
