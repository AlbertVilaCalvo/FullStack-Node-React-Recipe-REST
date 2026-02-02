locals {
  nodepool_name = "default"
}

resource "kubernetes_manifest" "karpenter_node_pool" {
  depends_on = [kubernetes_manifest.karpenter_ec2_node_class]

  manifest = {
    apiVersion = "karpenter.sh/v1"
    kind       = "NodePool"
    metadata = {
      name = local.nodepool_name
    }
    spec = {
      template = {
        spec = {
          nodeClassRef = {
            group = "karpenter.k8s.aws"
            kind  = "EC2NodeClass"
            name  = local.nodepool_name
          }
          requirements = [
            {
              key      = "kubernetes.io/arch"
              operator = "In"
              values   = ["amd64"]
            },
            {
              key      = "kubernetes.io/os"
              operator = "In"
              values   = ["linux"]
            },
            {
              key      = "karpenter.sh/capacity-type"
              operator = "In"
              values   = var.capacity_types
            },
            {
              key      = "node.kubernetes.io/instance-type"
              operator = "In"
              values   = var.instance_types
            }
          ]
        }
      }
      limits = {
        cpu    = var.cpu_limit
        memory = var.memory_limit
      }
      disruption = {
        consolidationPolicy = "WhenEmptyOrUnderutilized"
        consolidateAfter    = var.consolidate_after
      }
    }
  }
}

# AWS-specific configuration for nodes
resource "kubernetes_manifest" "karpenter_ec2_node_class" {
  manifest = {
    apiVersion = "karpenter.k8s.aws/v1"
    kind       = "EC2NodeClass"
    metadata = {
      name = local.nodepool_name
    }
    spec = {
      amiSelectorTerms = [
        { alias = "al2023@latest" }
      ]
      # IAM role applied to the EC2 instances provisioned by Karpenter
      role = var.node_iam_role_name
      # Subnets where Karpenter should launch the EC2 instances. See vpc/subnets.tf.
      subnetSelectorTerms = [
        {
          tags = {
            "karpenter.sh/discovery" = var.cluster_name
          }
        }
      ]
      # Security groups applied to the EC2 instances provisioned by Karpenter. See vpc/security-groups.tf.
      securityGroupSelectorTerms = [
        {
          tags = {
            "karpenter.sh/discovery"                    = var.cluster_name
            "kubernetes.io/cluster/${var.cluster_name}" = "owned"
          }
        }
      ]
    }
  }
}
