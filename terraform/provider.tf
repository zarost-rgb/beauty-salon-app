# ==============================================================================
# Konfiguracja dostawcy AWS oraz wymaganych wersji narzedzia Terraform
# ==============================================================================

terraform {
  # Wymagana minimalna wersja Terraform
  required_version = ">= 1.5.0"

  # Definicja oficjalnego dostawcy AWS od HashiCorp
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Inicjalizacja i konfiguracja dostawcy AWS
provider "aws" {
  region = var.aws_region

  # Domyslne tagi nakladane automatycznie na wszystkie zasoby infrastruktury
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
