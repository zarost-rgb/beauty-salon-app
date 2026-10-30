# ==============================================================================
# Zmienne wejsciowe (Variables) dla modulu infrastruktury AWS
# ==============================================================================

# Region geograficzny chmury AWS
variable "aws_region" {
  description = "Region chmury AWS dla wszystkich powolywanych zasobow"
  type        = string
  default     = "eu-central-1"
}

# Nazwa identyfikacyjna projektu (wykorzystywana w nazewnictwie zasobow i tagach)
variable "project_name" {
  description = "Nazwa projektu sluzaca jako prefiks dla tworzonych zasobow"
  type        = string
  default     = "beauty-salon-app"
}

# Srodowisko uruchomieniowe (np. production, staging, development)
variable "environment" {
  description = "Nazwa srodowiska wdrozeniowego"
  type        = string
  default     = "production"
}

# Glowny blok adresowy CIDR dla dedykowanej sieci wirtualnej (VPC)
variable "vpc_cidr" {
  description = "Glowna pula adresowa CIDR dla wirtualnej sieci prywatnej (VPC)"
  type        = string
  default     = "10.0.0.0/16"
}

# Blok adresowy CIDR dla podsieci publicznej
variable "public_subnet_cidr" {
  description = "Pula adresowa CIDR przeznaczona dla publicznej podsieci"
  type        = string
  default     = "10.0.1.0/24"
}

# Strefa dostepnosci (Availability Zone) w wybranym regionie AWS
variable "availability_zone" {
  description = "Strefa dostepnosci AWS dla podsieci publicznej"
  type        = string
  default     = "eu-central-1a"
}

# Rozmiar i typ instancji wirtualnej AWS EC2
variable "instance_type" {
  description = "Typ instancji wirtualnej AWS EC2 (rekomendowany t3.small lub t3.micro)"
  type        = string
  default     = "t3.small"
}

# Sciezka do lokalnego pliku klucza publicznego SSH uzytkownika
variable "ssh_public_key_path" {
  description = "Lokalna sciezka do klucza publicznego SSH uzywanego do autoryzacji"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

# Lista blokow CIDR z dozwolonym dostepem do portu administracyjnego SSH (22)
variable "allowed_ssh_cidrs" {
  description = "Dozwolone zrodlowe adresy IP lub pule CIDR dla polaczen SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Rozmiar glownego wolumenu dyskowego (Root EBS Volume) w GB
variable "root_volume_size" {
  description = "Rozmiar glownego dysku systemowego EBS (w GB)"
  type        = number
  default     = 20
}
