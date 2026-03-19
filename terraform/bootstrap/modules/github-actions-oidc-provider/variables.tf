variable "create_oidc_provider" {
  description = "Whether to create the AWS IAM OIDC provider. Set to false if it already exists in the same AWS account."
  type        = bool
}
