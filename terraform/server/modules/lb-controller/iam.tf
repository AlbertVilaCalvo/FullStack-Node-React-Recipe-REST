# IAM Role for AWS Load Balancer Controller
resource "aws_iam_role" "lb_controller" {
  name = "${var.app_name}-lb-controller-role-${var.environment}"

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

resource "aws_eks_pod_identity_association" "lb_controller" {
  cluster_name    = var.cluster_name
  namespace       = local.namespace
  service_account = local.service_account_name
  role_arn        = aws_iam_role.lb_controller.arn

  tags = {
    Name = "${var.app_name}-pod-identity-association-lb-controller-${var.environment}"
  }
}

resource "aws_iam_policy" "lb_controller" {
  name        = "${var.app_name}-lb-controller-policy-${var.environment}"
  description = "IAM policy for AWS Load Balancer Controller for ${var.app_name} in ${var.environment} environment"
  # From https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.17.0/docs/install/iam_policy.json
  policy = file("${path.module}/lb_controller_iam_policy.json")
}

resource "aws_iam_role_policy_attachment" "lb_controller" {
  role       = aws_iam_role.lb_controller.name
  policy_arn = aws_iam_policy.lb_controller.arn
}
