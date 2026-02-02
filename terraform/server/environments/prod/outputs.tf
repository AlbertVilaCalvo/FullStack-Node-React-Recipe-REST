# Because we are using -target, any output that uses a var (eg. var.aws_region)
# will only be available when all the modules have been applied and you run
# `terraform apply` (without -target) again. So don't do this:
# output "aws_region" {
#   description = "The AWS region where resources are deployed"
#   value       = var.aws_region
# }
# Note that you can still reference such vars in other outputs that depend on modules
# like we do in kubectl_config_command.

# VPC

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_node_subnet_ids" {
  description = "List of private subnet IDs for worker nodes"
  value       = module.vpc.private_node_subnet_ids
}

output "private_eni_subnet_ids" {
  description = "List of private subnet IDs for EKS control plane ENIs"
  value       = module.vpc.private_eni_subnet_ids
}

output "private_rds_subnet_ids" {
  description = "List of private subnet IDs for RDS"
  value       = module.vpc.private_rds_subnet_ids
}

# EKS

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "The endpoint of the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
}

# RDS

output "rds_address" {
  description = "The address of the RDS instance"
  value       = module.rds.db_instance_address
}

output "rds_port" {
  description = "The port of the RDS instance"
  value       = module.rds.db_instance_port
}

output "rds_database_name" {
  description = "The name of the database"
  value       = module.rds.db_name
}

output "rds_username" {
  description = "The username for the database"
  value       = module.rds.db_username
}

output "rds_secrets_manager_secret_rds_credentials_arn" {
  description = "The ARN of the Secrets Manager secret containing RDS credentials"
  value       = module.rds.secrets_manager_secret_rds_credentials_arn
}

# ECR

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = module.ecr.repository_url
}

# API Endpoint

output "api_certificate_arn" {
  description = "ARN of the ACM certificate for the API endpoint"
  value       = module.api_endpoint_certificate.certificate_arn
}

# Commands

output "kubectl_config_command" {
  description = "Command to update kubectl config"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "kubectl_namespace_command" {
  description = "Set the kubectl namespace"
  value       = "kubectl config set-context arn:aws:eks:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/${module.eks.cluster_name} --namespace recipe-manager"
}

output "docker_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${module.ecr.repository_url}"
}
