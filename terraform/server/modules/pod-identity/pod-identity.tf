# IAM Role for the server pods
resource "aws_iam_role" "server_pod" {
  name = "${var.app_name}-server-pod-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })
}

# Create an EKS Pod Identity Association between a service account in an
# EKS cluster and an IAM role with EKS Pod Identity, in a specific namespace.
# The pod identity agent running on the EKS nodes will use this association to
# provide the IAM role credentials to the pods running with the specified
# service account. The AWS SDKs and CLI running in the pod will then use these
# credentials for AWS API calls.
# See the ServiceAccount definition at server/kubernetes/base/serviceaccount.yaml
resource "aws_eks_pod_identity_association" "server" {
  cluster_name    = var.cluster_name
  namespace       = var.namespace
  service_account = var.service_account_name
  role_arn        = aws_iam_role.server_pod.arn

  tags = {
    Name = "${var.app_name}-pod-identity-association-server-${var.environment}"
  }
}
