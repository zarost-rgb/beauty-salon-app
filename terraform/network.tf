# ==============================================================================
# Konfiguracja sieciowa (VPC, Podsiec, Internet Gateway, Tabela Routingu)
# ==============================================================================

# Dedykowana wirtualna siec prywatna (Virtual Private Cloud)
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Brama internetowa (Internet Gateway) umozliwiajaca ruch do i z Internetu
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Publiczna podsiec powiazana z brama internetowa
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# Tabela routingu dla podsieci publicznej (domyslna trasa 0.0.0.0/0 kierowana do bramy IGW)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Skojarzenie tabeli routingu z podsiecia publiczna
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
