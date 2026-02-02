locals {
  description = "${var.app_name} web hosting with domain ${var.domain_name} in ${var.environment} environment"
}

resource "aws_cloudfront_distribution" "web_hosting" {
  depends_on = [aws_acm_certificate_validation.web_hosting]

  enabled             = true
  is_ipv6_enabled     = true
  comment             = local.description
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  aliases             = [var.domain_name, local.www_domain_name]

  origin {
    domain_name              = aws_s3_bucket.web_hosting.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.web_hosting.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.web_hosting.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.web_hosting.bucket}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect_www_to_apex.arn
    }
  }

  # Fix SPA routing. When you refresh a page like /about, you get 'AccessDenied' with response 403 Forbidden
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.web_hosting.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# Limit the S3 bucket access to only authenticated requests from CloudFront
resource "aws_cloudfront_origin_access_control" "web_hosting" {
  name                              = "${var.app_name}-web-oac"
  description                       = local.description
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Allow CloudFront to access S3 objects
resource "aws_s3_bucket_policy" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal-${var.app_name}-${var.environment}"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.web_hosting.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.web_hosting.arn
          }
        }
      }
    ]
  })
}

resource "aws_cloudfront_function" "redirect_www_to_apex" {
  name    = "${var.app_name}-redirect-www-to-apex-${var.environment}"
  runtime = "cloudfront-js-1.0"
  comment = "Redirect www.${var.domain_name} to ${var.domain_name} for application ${var.app_name} in ${var.environment} environment"
  publish = true
  code    = file("${path.root}/../../modules/web-hosting/cloudfront-functions/redirect-www-to-apex/redirect-www-to-apex.js")
}
