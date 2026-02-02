# Note: comments assume that VPC CIDR is 10.0.0.0/16

# Public Subnets - For ALB/Ingress and NAT Gateways (/24 = 256 IPs each)
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index) # 10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.app_name}-public-${var.availability_zones[count.index]}-${var.environment}"
    Type                                        = "public"
    "kubernetes.io/role/elb"                    = "1"      # Used by Load Balancer Controller to discover subnets for internet-facing load balancers
    "kubernetes.io/cluster/${var.cluster_name}" = "shared" # Used by Load Balancer Controller to discover cluster subnets
  }
}

# Private Subnets - For Worker Nodes (/22 = 1024 IPs each)
resource "aws_subnet" "private_nodes" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 6, count.index + 4) # 10.0.16.0/22, 10.0.20.0/22, 10.0.24.0/22
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name                                        = "${var.app_name}-private-nodes-${var.availability_zones[count.index]}-${var.environment}"
    Type                                        = "private-nodes"
    "kubernetes.io/role/internal-elb"           = "1"              # Used by Load Balancer Controller to discover subnets for internal load balancers
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"         # Used by Load Balancer Controller to discover cluster subnets
    "karpenter.sh/discovery"                    = var.cluster_name # Used by Karpenter to discover subnets for provisioning EC2 instances, see subnetSelectorTerms in karpenter-nodepool.tf
  }
}

# Private Subnets - For EKS Control Plane ENIs (/28 = 16 IPs each)
resource "aws_subnet" "private_eni" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 12, count.index + 160) # 10.0.10.0/28, 10.0.10.16/28, 10.0.10.32/28
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.app_name}-private-eni-${var.availability_zones[count.index]}-${var.environment}"
    Type = "private-eni"
    # ENI subnets don't need discovery tags since EKS uses the subnets you explicitly specify in the EKS cluster configuration to place ENIs
  }
}

# Private Subnets - For RDS (/24 = 256 IPs each)
resource "aws_subnet" "private_rds" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 32) # 10.0.32.0/24, 10.0.33.0/24, 10.0.34.0/24
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.app_name}-private-rds-${var.availability_zones[count.index]}-${var.environment}"
    Type = "private-rds"
    # No discovery tags here since these subnets are used only by RDS database instances
  }
}
