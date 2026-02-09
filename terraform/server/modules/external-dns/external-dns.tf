# ExternalDNS creates two DNS records in Route53 due to the annotation on the Ingress.
# TXT record to label owned DNS records:
#   Record name: externaldns-cname-api.recipemanager.link
#   Type: TXT
#   Alias: No
#   Value/Route traffic to: "heritage=external-dns,external-dns/owner=recipe-manager-eks-dev,external-dns/resource=ingress/recipe-manager/recipe-manager-api"
#   TTL: 300
# A record for the API endpoint pointing to the ALB:
#   Record name: api.recipemanager.link
#   Type: A
#   Alias: Yes
#   Value/Route traffic to: recipe-manager-api-lb-dev-1822519741.us-east-1.elb.amazonaws.com.
#   TTL: -

locals {
  service_account_name = "external-dns"
  namespace            = "kube-system"
}

data "aws_route53_zone" "api_endpoint" {
  # Get the root domain from the full API endpoint domain (api.recipemanager.link -> recipemanager.link)
  name         = join(".", slice(split(".", var.api_endpoint), length(split(".", var.api_endpoint)) - 2, length(split(".", var.api_endpoint))))
  private_zone = false
}

resource "helm_release" "external_dns" {
  depends_on = [
    aws_eks_pod_identity_association.external_dns,
    aws_iam_role_policy_attachment.external_dns
  ]

  name       = "external-dns"
  repository = "https://kubernetes-sigs.github.io/external-dns"
  chart      = "external-dns"
  version    = var.chart_version
  namespace  = local.namespace

  values = [
    yamlencode({
      serviceAccount = {
        create = true
        name   = local.service_account_name
      }
      provider = {
        name = "aws"
      }
      env = [
        {
          name  = "AWS_DEFAULT_REGION"
          value = var.aws_region
        }
      ]
      # https://artifacthub.io/packages/helm/external-dns/external-dns
      # https://github.com/kubernetes-sigs/external-dns/blob/master/charts/external-dns/values.yaml
      # https://github.com/kubernetes-sigs/external-dns/blob/master/charts/external-dns/templates/deployment.yaml
      # https://kubernetes-sigs.github.io/external-dns/latest/docs/flags/
      # https://kubernetes-sigs.github.io/external-dns/latest/docs/tutorials/aws-filters/
      # --source=ingress: Watch Ingress resources for hostnames
      sources = ["ingress"]
      # --domain-filter: Make ExternalDNS see only the hosted zones matching provided domain, omit other zones
      domainFilters = [data.aws_route53_zone.api_endpoint.name]
      # --policy=sync: Allow ExternalDNS to delete records when Ingress is deleted
      policy = "sync"
      # --txt-prefix: Prefix for TXT ownership records to avoid conflicts with CNAME records
      txtPrefix = "externaldns-"
      # --txt-owner-id: Unique identifier for this ExternalDNS instance
      # Must be a unique value that doesn't change for the lifetime of your cluster
      txtOwnerId = var.cluster_name
      # Extra arguments for flags that are not supported by the Helm chart
      extraArgs = [
        # --zone-id-filter: Only manage records in the specified hosted zone
        "--zone-id-filter=${data.aws_route53_zone.api_endpoint.zone_id}",
        # --exclude-record-types=AAAA: Only create A records (ALB is IPv4 only)
        "--exclude-record-types=AAAA"
      ]
      # Allow scheduling on the bootstrap nodes of the managed node group.
      # Note we don't set nodeSelector here like we do for the Karpenter
      # controller (see karpenter-controller.tf) to allow ExternalDNS to run on any
      # node, including Karpenter-provisioned nodes.
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
    })
  ]
}
