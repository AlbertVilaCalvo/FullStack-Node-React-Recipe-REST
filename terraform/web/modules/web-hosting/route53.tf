locals {
  www_domain_name = "www.${var.domain_name}"
}

data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# DNS records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.web_hosting.domain_validation_options : dvo.domain_name => {
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

# Route 53 records

resource "aws_route53_record" "web_hosting_apex" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web_hosting.domain_name
    zone_id                = aws_cloudfront_distribution.web_hosting.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web_hosting_www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.www_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web_hosting.domain_name
    zone_id                = aws_cloudfront_distribution.web_hosting.hosted_zone_id
    evaluate_target_health = false
  }
}

# AAAA records for IPv6

resource "aws_route53_record" "web_apex_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.web_hosting.domain_name
    zone_id                = aws_cloudfront_distribution.web_hosting.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web_www_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.www_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.web_hosting.domain_name
    zone_id                = aws_cloudfront_distribution.web_hosting.hosted_zone_id
    evaluate_target_health = false
  }
}
