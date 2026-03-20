# The GitHub Actions OIDC identity provider only needs to be created once per AWS account.
# All GitHub Actions workflows in this account (web deploy, server ECR push, etc.) share
# this single provider. Each workflow gets its own IAM role with least-privilege permissions
# (see terraform/modules/github-oidc-role).
#
# AWS no longer validates the thumbprint for token.actions.githubusercontent.com, but
# the resource schema still requires at least one value.
# From: https://github.blog/changelog/2023-06-27-github-actions-update-on-oidc-integration-with-aws/
resource "aws_iam_openid_connect_provider" "github_actions" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}
