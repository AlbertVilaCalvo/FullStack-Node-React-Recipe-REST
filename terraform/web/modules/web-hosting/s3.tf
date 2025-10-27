resource "aws_s3_bucket" "web_hosting" {
  bucket        = "${var.app_name}-web-hosting-${local.account_id}-${var.environment}"
  force_destroy = true
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disable ACLs (use bucket policies only)
resource "aws_s3_bucket_ownership_controls" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# We wipe all bucket files on every deploy, and we can roll back to any previous version from version control,
# so versioning is not needed
resource "aws_s3_bucket_versioning" "web_hosting" {
  bucket = aws_s3_bucket.web_hosting.id
  versioning_configuration {
    status = "Disabled"
  }
}
