# ==============================================================================
# Zmienne wyjsciowe (Outputs) po utworzeniu infrastruktury w chmurze AWS
# ==============================================================================

# Identyfikator instancji EC2
output "instance_id" {
  description = "Identyfikator instancji wirtualnej AWS EC2"
  value       = aws_instance.app_server.id
}

# Staly publiczny adres IP (Elastic IP)
output "public_ip" {
  description = "Staly publiczny adres Elastic IP serwera aplikacji"
  value       = aws_eip.app_eip.public_ip
}

# Publiczna nazwa domenowa DNS instancji
output "public_dns" {
  description = "Publiczny adres domenowy DNS przypisany do instancji"
  value       = aws_eip.app_eip.public_dns
}

# Gotowe polecenie SSH do bezpiecznego zalogowania sie na serwer
output "ssh_command" {
  description = "Polecenie SSH sluzace do nawiazania polaczenia terminalowego"
  value       = "ssh -i ${replace(var.ssh_public_key_path, ".pub", "")} ubuntu@${aws_eip.app_eip.public_ip}"
}

# Adres URL do glownej aplikacji internetowej Beauty Salon
output "app_url" {
  description = "Bezposredni adres URL do aplikacji internetowej Beauty Salon"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

# Adres URL do panelu monitoringu i wizualizacji Grafana
output "grafana_url" {
  description = "Bezposredni adres URL do interfejsu Grafana"
  value       = "http://${aws_eip.app_eip.public_ip}:3000"
}

# Sformatowany wpis inwentarza dla narzedzia Ansible
output "ansible_inventory_entry" {
  description = "Wiersz inwentarza do skopiowania do pliku ansible/inventory.ini"
  value       = "beauty-server ansible_host=${aws_eip.app_eip.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=${replace(var.ssh_public_key_path, ".pub", "")}"
}
