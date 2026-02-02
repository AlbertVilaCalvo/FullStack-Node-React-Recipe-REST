# Cluster Security Group (additional)
# ***********************************

# Allows all outbound, same as default EKS SG. We could comment it and use the default one created by EKS:
# referenced_security_group_id = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id

resource "aws_security_group" "cluster" {
  name        = "${var.app_name}-eks-cluster-sg-${var.environment}"
  description = "Additional security group for EKS cluster control plane for ${var.app_name} in ${var.environment} environment"
  vpc_id      = var.vpc_id
}

# Allow all outbound traffic from cluster
resource "aws_vpc_security_group_egress_rule" "cluster_outbound_all" {
  security_group_id = aws_security_group.cluster.id
  description       = "Allow all outbound traffic"

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}

# See ingress rule below for node to cluster on 443

# Node Security Group
# *******************

resource "aws_security_group" "node" {
  name        = "${var.app_name}-eks-node-sg-${var.environment}"
  description = "Security group for EKS worker nodes for ${var.app_name} in ${var.environment} environment"
  vpc_id      = var.vpc_id

  tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "owned"
    "karpenter.sh/discovery"                      = local.cluster_name
  }
}

# Node outbound
resource "aws_vpc_security_group_egress_rule" "node_outbound" {
  security_group_id = aws_security_group.node.id
  description       = "Allow all outbound"

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"
}

# Node to node communication (all traffic: TCP, UDP, ICMP...)
#
# Kubernetes on EKS with the AWS VPC CNI requires node-to-node communication across many
# ports (0-65535) and protocols, for example:
# - Pod-to-pod traffic - Pods communicate directly using VPC IPs on various ports
# - DNS (UDP on port 53) is required for CoreDNS, used for DNS resolution in the cluster
# - NodePort services - Use ports 30000-32767
# - kube-proxy - Needs multiple ports for service proxying
resource "aws_vpc_security_group_ingress_rule" "node_to_node_all" {
  security_group_id = aws_security_group.node.id
  description       = "Node to node communication (all ports and protocols)"

  ip_protocol                  = "-1"
  referenced_security_group_id = aws_security_group.node.id
}

# Cluster to node on 443 (Kubernetes API, for control plane to node communication)
resource "aws_vpc_security_group_ingress_rule" "cluster_to_node_443" {
  security_group_id = aws_security_group.node.id
  description       = "Cluster to node 443"

  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.cluster.id
}

# Cluster to node on 10250 (kubelet)
resource "aws_vpc_security_group_ingress_rule" "cluster_to_node_10250" {
  security_group_id = aws_security_group.node.id
  description       = "Cluster to node 10250"

  from_port                    = 10250
  to_port                      = 10250
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.cluster.id
}

# Cluster to node on 9443 (AWS Load Balancer Controller Webhook)
# The LBC webhook service runs on port 9443 on the nodes (via a pod).
# The Kubernetes API server (running in the control plane) needs to reach this webhook
# to validate Ingress resources.
resource "aws_vpc_security_group_ingress_rule" "cluster_to_node_9443" {
  security_group_id = aws_security_group.node.id
  description       = "Cluster to node 9443 (LBC Webhook)"

  from_port                    = 9443
  to_port                      = 9443
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.cluster.id
}

# Node to cluster on 443
#
# Nodes need to communicate with API server for:
# - Registration: when a node starts up, the kubelet process running on the node registers the
#   node at the API server to join the cluster.
# - Nodes continuously send heartbeats and status updates to the API server to indicate they
#   are healthy (Ready status).
# - Pod scheduling: nodes need to query the API server to know which Pods have been assigned to
#   them so they can run them.
# - System add-ons (aws-node VPC CNI, CoreDNS, kube-proxy) running on the nodes need to talk to
#   the API server to function.
#
# Note that this rule is added to the cluster SG, not the node SG
resource "aws_vpc_security_group_ingress_rule" "node_to_cluster_443" {
  security_group_id = aws_security_group.cluster.id
  description       = "Node to cluster 443"

  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.node.id
}
