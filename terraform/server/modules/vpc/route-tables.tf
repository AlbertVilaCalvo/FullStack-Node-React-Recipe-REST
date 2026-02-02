# Public Route Table

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-public-rt-${var.environment}"
    Type = "public"
  }
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables for Node Subnets

resource "aws_route_table" "private_nodes" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-private-nodes-rt-${var.availability_zones[count.index]}-${var.environment}"
    Type = "private-nodes"
  }
}

resource "aws_route" "private_nodes_nat" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  route_table_id         = aws_route_table.private_nodes[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[count.index].id
}

resource "aws_route_table_association" "private_nodes" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_nodes[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.private_nodes[0].id : aws_route_table.private_nodes[count.index].id
}

# Private Route Tables for ENI Subnets

resource "aws_route_table" "private_eni" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-private-eni-rt-${var.availability_zones[count.index]}-${var.environment}"
    Type = "private-eni"
  }
}

resource "aws_route" "private_eni_nat" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  route_table_id         = aws_route_table.private_eni[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[count.index].id
}

resource "aws_route_table_association" "private_eni" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_eni[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.private_eni[0].id : aws_route_table.private_eni[count.index].id
}

# Private Route Tables for RDS Subnets (no NAT needed, internal only)

resource "aws_route_table" "private_rds" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-private-rds-rt-${var.environment}"
    Type = "private-rds"
  }
}

resource "aws_route_table_association" "private_rds" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_rds[count.index].id
  route_table_id = aws_route_table.private_rds.id
}
