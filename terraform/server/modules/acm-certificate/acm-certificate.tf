# ACM Certificate
# This certificate doesn't need to be created in us-east-1 like the
# CloudFront certificate for the web distribution. It needs to be in
# the same region as the ALB (i.e. the EKS cluster region).

data "aws_route53_zone" "main" {
  name         = var.hosted_zone_name
  private_zone = false
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.app_name}-${replace(var.domain_name, ".", "-")}-cert-${var.environment}"
  }
}

# Route53 records for certificate validation
resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.main.zone_id
}

# Wait for certificate validation to complete
resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}
