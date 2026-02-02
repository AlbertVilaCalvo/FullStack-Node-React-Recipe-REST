output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_node_subnet_ids" {
  description = "List of private subnet IDs for worker nodes"
  value       = aws_subnet.private_nodes[*].id
}

output "private_eni_subnet_ids" {
  description = "List of private subnet IDs for EKS control plane ENIs"
  value       = aws_subnet.private_eni[*].id
}

output "private_rds_subnet_ids" {
  description = "List of private subnet IDs for RDS"
  value       = aws_subnet.private_rds[*].id
}
