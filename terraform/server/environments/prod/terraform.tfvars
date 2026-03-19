app_name    = "recipe-manager"
environment = "prod"
aws_region  = "us-east-1"
web_domain  = "recipeapp.link"

# Endpoints
server_hosted_zone_name = "recipeapp.link"
api_endpoint            = "api.recipeapp.link"
argocd_endpoint         = "argocd.recipeapp.link"

# VPC
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
single_nat_gateway = false # High availability for prod

# EKS
kubernetes_version     = "1.34"
endpoint_public_access = true
public_access_cidrs    = [] # Set your IP address (84.39.22.200/32) or CIDR block here
# Order matters: AWS provisions instances in the exact order listed
node_instance_types     = ["t3a.large", "t3.large", "t3a.xlarge", "t3.xlarge"]
node_group_min_size     = 2
node_group_max_size     = 5
node_group_desired_size = 3
node_disk_size          = 20
node_capacity_type      = "ON_DEMAND"
log_retention_days      = 90

# RDS
database_name            = "recipe_manager_prod" # PostgreSQL does not accept hyphens, only underscores
master_username          = "postgres"
db_instance_class        = "db.t4g.small"
db_allocated_storage     = 50
db_max_allocated_storage = 100
engine_version           = "18.3"
multi_az                 = true
backup_retention_period  = 35
backup_window            = "03:00-04:00"
maintenance_window       = "Sun:04:00-Sun:05:00"
deletion_protection      = true
skip_final_snapshot      = false

# App Secrets
secretsmanager_secret_recovery_days = 30

# Load Balancer Controller
lb_controller_chart_version = "1.17.1"

# ExternalDNS
external_dns_chart_version = "1.20.0"

# External Secrets Operator
external_secrets_chart_version = "2.0.1"

# Karpenter Controller
karpenter_chart_version = "1.8.3"

# Karpenter NodePool
# Order does not matter: Karpenter automatically provisions the cheapest available instance
karpenter_instance_types    = ["t3a.small", "t3.small", "t3a.medium", "t3.medium", "t3a.large", "t3.large", "t3a.xlarge", "t3.xlarge"]
karpenter_capacity_types    = ["on-demand"]
karpenter_cpu_limit         = 100
karpenter_memory_limit      = "100Gi"
karpenter_consolidate_after = "5m" # Longer wait time means less frequent node consolidation, which reduces pod evictions and restarts

# Email Configuration
email_user     = "noreply@recipeapp.link"
email_password = "placeholder"
