locals {
  service_account_name = "aws-load-balancer-controller"
  namespace            = "aws-load-balancer-controller"
}

resource "helm_release" "aws_load_balancer_controller" {
  depends_on = [
    aws_eks_pod_identity_association.lb_controller,
    aws_iam_role_policy_attachment.lb_controller
  ]

  name             = "aws-load-balancer-controller"
  repository       = var.chart_path != null ? null : "https://aws.github.io/eks-charts"
  chart            = var.chart_path != null ? var.chart_path : "aws-load-balancer-controller"
  version          = var.chart_path != null ? null : var.chart_version
  namespace        = local.namespace
  create_namespace = true

  values = [
    yamlencode({
      clusterName = var.cluster_name
      serviceAccount = {
        create = true
        name   = local.service_account_name
      }
      region = var.aws_region
      vpcId  = var.vpc_id
      # Allow scheduling on the bootstrap nodes of the managed node group.
      # Note we don't set nodeSelector here like we do for the Karpenter
      # controller (see karpenter-controller.tf) to allow the Load Balancer Controller
      # to run on any node, including Karpenter-provisioned nodes once they exist.
      # We only need to tolerate the managed node group nodes, not force the LBC to run
      # only on the managed node group nodes.
      tolerations = [{
        key      = "karpenter.sh/controller"
        operator = "Exists"
        effect   = "NoSchedule"
      }]
      # Disable the Service Mutator webhook (mservice.elbv2.k8s.aws).
      # This is a cluster-wide mutating admission webhook (MutatingWebhookConfiguration) that intercepts every Service
      # create/update call and:
      #   1. Adds a finalizer to Services of type LoadBalancer so the LBC can clean up the AWS load balancer on deletion.
      #   2. Injects LBC-managed annotations/labels needed to provision an NLB or CLB directly from a Service resource.
      # See https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
      # We don't need the Load Balancer Controller mutating webhook because:
      #   - The webhook watches for Services. Our load balancer is provisioned via an Ingress resource, not a Service.
      #   - Our application service has type ClusterIP, not LoadBalancer, which the webhook ignores anyway.
      # Disabling it also prevents a race condition when installing charts in parallel with:
      #   terraform apply -target=module.lb_controller -target=module.external_dns -target=module.external_secrets -target=module.karpenter_controller
      # The error is:
      #   Internal error occurred: failed calling webhook "mservice.elbv2.k8s.aws": failed to call webhook: Post
      #   "https://aws-load-balancer-webhook-service.aws-load-balancer-controller.svc:443/mutate-v1-service?timeout=10s": no endpoints available for service "aws-load-balancer-webhook-service"
      # The error happens because external secrets tries to create a Service while the Load Balancer Controller's mutating
      # webhook pods are not yet ready, causing the service creation and the whole Helm release installation to fail.
      enableServiceMutatorWebhook = false
    })
  ]
}
