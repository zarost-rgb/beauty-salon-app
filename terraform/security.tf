# ==============================================================================
# Konfiguracja reguł zapory ogniowej (AWS Security Group)
# ==============================================================================

# Grupa bezpieczenstwa kontrolujaca ruch sieciowy do i z serwera aplikacji
resource "aws_security_group" "web_server" {
  name        = "${var.project_name}-sg"
  description = "Reguly bezpieczenstwa dla serwera aplikacji Beauty Salon (SSH, HTTP, HTTPS, Grafana)"
  vpc_id      = aws_vpc.main.id

  # Regula wejsciowa: Dostep administracyjny przez SSH (port 22)
  ingress {
    description = "Polaczenie administracyjne SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # Regula wejsciowa: Ruch HTTP dla aplikacji internetowej (port 80)
  ingress {
    description = "Ruch HTTP do bramy Nginx Reverse Proxy"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regula wejsciowa: Szyfrowany ruch HTTPS (port 443)
  ingress {
    description = "Ruch szyfrowany HTTPS dla aplikacji internetowej"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regula wejsciowa: Dostep do dashboardow monitoringu Grafana (port 3000)
  ingress {
    description = "Dostep do interfejsu Grafana dla zespolu operacyjnego"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regula wyjsciowa: Niekrepowany ruch wychodzacy (pobieranie pakietow, aktualizacje, Docker registry)
  egress {
    description = "Caly ruch wychodzacy z serwera do Internetu"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-security-group"
  }
}
