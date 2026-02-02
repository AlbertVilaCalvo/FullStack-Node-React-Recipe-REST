# ACM Certificate for API endpoint
# This certificate doesn't need to be created in us-east-1 like the
# CloudFront certificate for the web distribution. It needs to be in
# the same region as the ALB (ie the EKS cluster).
resource "aws_acm_certificate" "api_endpoint" {
  domain_name       = var.api_endpoint
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.app_name}-api-endpoint-cert-${var.environment}"
  }
}

# Route53 records for certificate validation
resource "aws_route53_record" "api_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_endpoint.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "api_endpoint" {
  certificate_arn         = aws_acm_certificate.api_endpoint.arn
  validation_record_fqdns = [for record in aws_route53_record.api_validation : record.fqdn]
}
