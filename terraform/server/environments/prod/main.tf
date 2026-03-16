# Load Balancer Controller, ExternalDNS and Karpenter Controller Helm charts must be applied
# AFTER the EKS cluster is created, otherwise you get errors like "Kubernetes cluster unreachable:
# the server has asked for the client to provide credentials".
# And the Karpenter NodePool and the EC2NodeClass must be applied AFTER the Karpenter Helm chart
# is installed, otherwise you get this error: "API did not recognize GroupVersionKind from manifest
# (CRD may not be installed) ... no matches for kind "EC2NodeClass" in group "karpenter.k8s.aws"".
# Do this:
# 1. Create VPC, EKS cluster, RDS database, ECR repository etc.:
#    terraform apply -target=module.vpc -target=module.eks -target=module.rds -target=module.ecr -target=module.pod_identity -target=module.api_endpoint_certificate -target=module.app_secrets
# 2. EKS cluster created -> install Helm charts:
#    terraform apply -target=module.lb_controller -target=module.external_dns -target=module.external_secrets -target=module.karpenter_controller
# 3. Karpenter CRDs installed -> create Karpenter NodePool and EC2NodeClass:
#    terraform apply -target=module.karpenter_nodepool
# 4. Deploy the Kubernetes manifests with kubectl -> LBC creates the ALB via Ingress, ExternalDNS automatically creates Route53 A record for API endpoint.
# This can be solved with Terraform Stacks, see https://developer.hashicorp.com/terraform/tutorials/cloud/stacks-eks-deferred

data "aws_caller_identity" "current" {}

locals {
  cluster_name = "${var.app_name}-eks-${var.environment}"
  namespace    = "recipe-manager"

  lb_controller_chart_path    = fileexists("${path.module}/.charts/aws-load-balancer-controller-${var.lb_controller_chart_version}.tgz") ? "${path.module}/.charts/aws-load-balancer-controller-${var.lb_controller_chart_version}.tgz" : null
  external_dns_chart_path     = fileexists("${path.module}/.charts/external-dns-${var.external_dns_chart_version}.tgz") ? "${path.module}/.charts/external-dns-${var.external_dns_chart_version}.tgz" : null
  external_secrets_chart_path = fileexists("${path.module}/.charts/external-secrets-${var.external_secrets_chart_version}.tgz") ? "${path.module}/.charts/external-secrets-${var.external_secrets_chart_version}.tgz" : null
}

# Infrastructure
# **************

module "vpc" {
  source = "../../modules/vpc"

  app_name    = var.app_name
  environment = var.environment

  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  cluster_name       = local.cluster_name
  single_nat_gateway = var.single_nat_gateway
}

module "eks" {
  source = "../../modules/eks"

  app_name    = var.app_name
  environment = var.environment

  kubernetes_version = var.kubernetes_version

  vpc_id                  = module.vpc.vpc_id
  private_eni_subnet_ids  = module.vpc.private_eni_subnet_ids
  private_node_subnet_ids = module.vpc.private_node_subnet_ids

  endpoint_public_access = var.endpoint_public_access
  public_access_cidrs    = var.public_access_cidrs

  node_instance_types     = var.node_instance_types
  node_group_min_size     = var.node_group_min_size
  node_group_max_size     = var.node_group_max_size
  node_group_desired_size = var.node_group_desired_size

  node_disk_size     = var.node_disk_size
  node_capacity_type = var.node_capacity_type

  log_retention_days = var.log_retention_days
}

module "rds" {
  source = "../../modules/rds"

  app_name    = var.app_name
  environment = var.environment

  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_rds_subnet_ids
  allowed_security_group_ids = [module.eks.node_security_group_id]

  database_name   = var.database_name
  master_username = var.master_username

  master_password_recovery_days = var.secretsmanager_secret_recovery_days

  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage
  engine_version          = var.engine_version
  multi_az                = var.multi_az
  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot
}

module "ecr" {
  source = "../../modules/ecr"

  app_name    = var.app_name
  environment = var.environment
}

module "pod_identity" {
  source = "../../modules/pod-identity"

  app_name    = var.app_name
  environment = var.environment

  cluster_name         = module.eks.cluster_name
  namespace            = local.namespace
  service_account_name = "recipe-manager-api"
  enable_s3_access     = false
}

module "api_endpoint_certificate" {
  source = "../../modules/api-endpoint-certificate"

  app_name    = var.app_name
  environment = var.environment

  api_endpoint = var.api_endpoint
}

module "app_secrets" {
  source = "../../modules/app-secrets"

  app_name    = var.app_name
  environment = var.environment

  secretsmanager_secret_recovery_days = var.secretsmanager_secret_recovery_days

  email_user     = var.email_user
  email_password = var.email_password
}

# Helm charts
# ***********

module "lb_controller" {
  source = "../../modules/lb-controller"

  app_name    = var.app_name
  environment = var.environment
  aws_region  = var.aws_region

  chart_version = var.lb_controller_chart_version
  chart_path    = local.lb_controller_chart_path

  cluster_name = module.eks.cluster_name
  vpc_id       = module.vpc.vpc_id
}

module "external_dns" {
  source = "../../modules/external-dns"

  app_name    = var.app_name
  environment = var.environment
  aws_region  = var.aws_region

  chart_version = var.external_dns_chart_version
  chart_path    = local.external_dns_chart_path

  cluster_name = module.eks.cluster_name
  api_endpoint = var.api_endpoint
}

module "external_secrets" {
  source = "../../modules/external-secrets"

  app_name    = var.app_name
  environment = var.environment

  chart_version = var.external_secrets_chart_version
  chart_path    = local.external_secrets_chart_path

  cluster_name = module.eks.cluster_name

  secrets_manager_secret_arns = [
    module.rds.secrets_manager_secret_rds_credentials_arn,
    module.app_secrets.jwt_secret_arn,
    module.app_secrets.email_user_secret_arn,
    module.app_secrets.email_password_secret_arn,
  ]

  ssm_parameter_arns = [
    module.rds.ssm_parameter_arn_rds_address
  ]
}

module "karpenter_controller" {
  source = "../../modules/karpenter-controller"

  app_name    = var.app_name
  environment = var.environment
  aws_region  = var.aws_region

  chart_version = var.karpenter_chart_version

  cluster_name       = module.eks.cluster_name
  cluster_endpoint   = module.eks.cluster_endpoint
  node_iam_role_name = module.eks.node_group_iam_role_name
}

# Karpenter NodePool and EC2NodeClass
# ***********************************

module "karpenter_nodepool" {
  # Karpenter CRDs need to be installed before creating the NodePool and EC2NodeClass
  depends_on = [module.karpenter_controller]

  source = "../../modules/karpenter-nodepool"

  cluster_name       = module.eks.cluster_name
  node_iam_role_name = module.eks.node_group_iam_role_name

  instance_types    = var.karpenter_instance_types
  capacity_types    = var.karpenter_capacity_types
  cpu_limit         = var.karpenter_cpu_limit
  memory_limit      = var.karpenter_memory_limit
  consolidate_after = var.karpenter_consolidate_after
}
