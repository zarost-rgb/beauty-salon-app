# ==============================================================================
# Konfiguracja zasobow obliczeniowych (Instancja EC2, Klucz SSH, Elastic IP)
# ==============================================================================

# Pobranie najnowszego oficjalnego obrazu bazowego Ubuntu 24.04 LTS AMI od Canonical
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Identyfikator oficjalnego konta Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Rejestracja klucza publicznego SSH w panelu AWS EC2 Key Pairs
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-deployer-key"
  public_key = file(pathexpand(var.ssh_public_key_path))

  tags = {
    Name = "${var.project_name}-ssh-key"
  }
}

# Utworzenie glownej instancji wirtualnej serwera aplikacji
resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.web_server.id]
  key_name                    = aws_key_pair.deployer.key_name
  associate_public_ip_address = true

  # Definicja glownego wolumenu dyskowego (Root EBS Volume)
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-root-disk"
    }
  }

  tags = {
    Name = "${var.project_name}-server"
  }
}

# Przypisanie stalego publicznego adresu IPv4 (Elastic IP) do utworzonej instancji
resource "aws_eip" "app_eip" {
  instance   = aws_instance.app_server.id
  domain     = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "${var.project_name}-elastic-ip"
  }
}
