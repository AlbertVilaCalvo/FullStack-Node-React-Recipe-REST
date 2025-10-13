# SSL Certificate. Must be created in us-east-1
resource "aws_acm_certificate" "web_hosting" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [local.www_domain_name]

  # Ensure new certificate is created and validated before destroying the old one
  # This prevents CloudFront from losing its SSL certificate during updates and avoids service disruption
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.app_name}-web-certificate-${var.environment}"
  }
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "web_hosting" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.web_hosting.arn
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
  ]
}
