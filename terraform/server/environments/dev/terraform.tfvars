app_name    = "recipe-manager"
environment = "dev"
aws_region  = "us-east-1"
web_domain  = "recipemanager.link"

# Domains
server_hosted_zone_name = "recipemanager.link"
api_domain              = "api.recipemanager.link"
argocd_domain           = "argocd.recipemanager.link"

# VPC
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
single_nat_gateway = true # Cost savings for dev

# EKS
kubernetes_version     = "1.34"
endpoint_public_access = true
public_access_cidrs    = ["0.0.0.0/0"]
# Order matters: AWS provisions instances in the exact order listed
node_instance_types     = ["t3a.medium", "t3.medium", "t3a.large", "t3.large"]
node_group_min_size     = 1
node_group_max_size     = 3
node_group_desired_size = 2
node_disk_size          = 20
node_capacity_type      = "ON_DEMAND"
log_retention_days      = 30

# RDS
database_name            = "recipe_manager_dev" # PostgreSQL does not accept hyphens, only underscores
master_username          = "postgres"
db_instance_class        = "db.t3.micro"
db_allocated_storage     = 20
db_max_allocated_storage = 100
engine_version           = "18.3"
multi_az                 = false # Single AZ for dev
backup_retention_period  = 15
backup_window            = "03:00-04:00"
maintenance_window       = "Sun:04:00-Sun:05:00"
deletion_protection      = false
skip_final_snapshot      = true

# App Secrets
secretsmanager_secret_recovery_days = 0 # Use 0 if you recreate infrastructure to avoid "InvalidRequestException: you can't create this secret because a secret with this name is already scheduled for deletion"

# Load Balancer Controller
lb_controller_chart_version = "1.17.1"

# ExternalDNS
external_dns_chart_version = "1.20.0"

# External Secrets Operator
external_secrets_chart_version = "2.0.1"

# Argo CD
argocd_chart_version = "9.4.15"

# Karpenter Controller
karpenter_chart_version = "1.8.3"

# Karpenter NodePool
# If you use spot and on-demand, you need at least 5 instance types, otherwise you get this error:
#   failed while checking on-demand fallback
#   at least 5 instance types are recommended when flexible to spot but requesting on-demand, the current provisioning request only has 2 instance type options
# AWS recommends 10, see https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html#be-instance-type-flexible
# Order does not matter: Karpenter automatically provisions the cheapest available instance
karpenter_instance_types    = ["t3a.small", "t3.small", "t3a.medium", "t3.medium", "t3a.large", "t3.large"]
karpenter_capacity_types    = ["on-demand", "spot"]
karpenter_cpu_limit         = 50
karpenter_memory_limit      = "50Gi"
karpenter_consolidate_after = "1m"

# Email Configuration
email_user     = "noreply@recipemanager.link"
email_password = "placeholder"

# GitHub Actions OIDC
github_org  = "AlbertVilaCalvo"
github_repo = "RecipeManager"
