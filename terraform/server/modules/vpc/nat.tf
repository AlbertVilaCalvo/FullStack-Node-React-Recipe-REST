resource "aws_eip" "nat" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  domain = "vpc"

  tags = {
    Name = "${var.app_name}-nat-eip-${var.availability_zones[count.index]}-${var.environment}"
  }
}

resource "aws_nat_gateway" "main" {
  depends_on = [aws_internet_gateway.main]

  count = var.single_nat_gateway ? 1 : length(var.availability_zones)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.app_name}-nat-${var.availability_zones[count.index]}-${var.environment}"
  }
}
