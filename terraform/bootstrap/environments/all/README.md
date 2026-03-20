# GitHub Actions OIDC Identity Provider

Creates the GitHub Actions OIDC identity provider, used for authenticating GitHub Actions
workflows with AWS.

The identity provider only needs to be created once per AWS account.
All GitHub Actions workflows in this account (web deploy, server ECR push, etc.) share
this single provider.

This is a one-time bootstrap step that must be applied before deploying any
web or server environment.

All environments reference the provider via data source:

```hcl
data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}
```

Usage:

```shell
cd terraform/bootstrap/environments/all
terraform init
terraform apply
```
