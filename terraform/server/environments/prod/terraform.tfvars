app_name    = "recipe-manager"
environment = "prod"
aws_region  = "us-east-1"
web_domain  = "recipeapp.link"

# VPC
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
single_nat_gateway = false # High availability for prod

# EKS
kubernetes_version      = "1.34"
endpoint_public_access  = true
public_access_cidrs     = ["0.0.0.0/0"]
node_instance_types     = ["t3.medium", "t3a.medium", "t3.large", "t3a.large"]
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
engine_version           = "16.3"
multi_az                 = true
backup_retention_period  = 35
backup_window            = "03:00-04:00"
maintenance_window       = "Sun:04:00-Sun:05:00"
deletion_protection      = true
skip_final_snapshot      = false

# API Endpoint
api_endpoint = "api.recipeapp.link"

# App Secrets
secretsmanager_secret_recovery_days = 30

# Load Balancer Controller
lb_controller_chart_version = "1.17.1"

# Karpenter Controller
karpenter_chart_version = "1.8.3"
karpenter_namespace     = "kube-system"

# Karpenter NodePool
karpenter_instance_types    = ["t3.small", "t3a.small", "t3.medium", "t3a.medium", "t3.large", "t3a.large", "t3.xlarge", "t3a.xlarge"]
karpenter_capacity_types    = ["on-demand"]
karpenter_cpu_limit         = 100
karpenter_memory_limit      = "100Gi"
karpenter_consolidate_after = "5m" # Longer wait time means less frequent node consolidation, which reduces pod evictions and restarts

# Email Configuration
email_user     = "noreply@recipeapp.link"
email_password = "placeholder"
