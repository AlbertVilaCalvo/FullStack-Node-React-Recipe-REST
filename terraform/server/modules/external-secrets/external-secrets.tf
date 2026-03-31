# The External Secrets Operator Helm chart is now managed by Argo CD (GitOps).
# This module only manages the IAM resources (role, policy, Pod Identity association)
# required by the operator. See kubernetes/argocd-apps/{dev,prod}/external-secrets-app.yaml.

locals {
  service_account_name = "external-secrets"
  namespace            = "external-secrets"
}
