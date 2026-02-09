# IAM Role for ExternalDNS
resource "aws_iam_role" "external_dns" {
  name = "${var.app_name}-external-dns-role-${var.environment}"

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

resource "aws_eks_pod_identity_association" "external_dns" {
  cluster_name    = var.cluster_name
  namespace       = local.namespace
  service_account = local.service_account_name
  role_arn        = aws_iam_role.external_dns.arn

  tags = {
    Name = "${var.app_name}-pod-identity-association-external-dns-${var.environment}"
  }
}

locals {
  external_dns_txt_prefix = "externaldns-"
}

resource "aws_iam_policy" "external_dns" {
  name        = "${var.app_name}-external-dns-policy-${var.environment}"
  description = "IAM policy for ExternalDNS to manage Route53 records in ${var.app_name} ${var.environment} environment"

  # https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md#iam-policy
  # https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws-sd.md#iam-permissions-with-abac
  # https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonroute53.html
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets"
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/${data.aws_route53_zone.api_endpoint.zone_id}"
        ]
        Condition = {
          "ForAllValues:StringLike" = {
            "route53:ChangeResourceRecordSetsNormalizedRecordNames" = [
              # api.recipemanager.link A
              var.api_endpoint,
              # externaldns-cname-api.recipemanager.link TXT
              "${local.external_dns_txt_prefix}*${var.api_endpoint}"
            ]
            "route53:ChangeResourceRecordSetsActions" = [
              "CREATE",
              "UPSERT",
              "DELETE"
            ]
            "route53:ChangeResourceRecordSetsRecordTypes" = [
              "A",
              "TXT"
            ]
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListResourceRecordSets",
          "route53:ListTagsForResources"
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/${data.aws_route53_zone.api_endpoint.zone_id}"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones"
        ]
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  role       = aws_iam_role.external_dns.name
  policy_arn = aws_iam_policy.external_dns.arn
}
