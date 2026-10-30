#!/usr/bin/env bash
# ==============================================================================
# Skrypt weryfikacyjny srodowiska AWS EC2 (Beauty Salon App)
# Sprawdza gotowosc serwera przed wdrozeniem kontenerow i prezentacja
# ==============================================================================

set -o pipefail

# Kolory do formatowania wynikow
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED_COUNT=0
FAILED_COUNT=0

print_header() {
  echo -e "\n${BLUE}================================================================${NC}"
  echo -e "${BLUE}  Raport Weryfikacji Gotowosci Serwera AWS EC2 (Beauty Salon)  ${NC}"
  echo -e "${BLUE}================================================================${NC}\n"
}

check_item() {
  local title="$1"
  local cmd="$2"

  echo -n -e "Sprawdzanie: ${title}... "
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "${GREEN}[PASS]${NC}"
    PASSED_COUNT=$((PASSED_COUNT + 1))
  else
    echo -e "${RED}[FAIL]${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
}

print_header

# 1. Sprawdzenie uslugi Docker
check_item "Usluga systemowa Docker (active)" "systemctl is-active docker"

# 2. Sprawdzenie wersji silnika Docker
check_item "Polecenie 'docker --version'" "docker --version"

# 3. Sprawdzenie wtyczki Docker Compose v2
check_item "Wtyczka Docker Compose v2 ('docker compose')" "docker compose version"

# 4. Sprawdzenie uprawnien uzytkownika do gniazda Dockera (bez sudo)
check_item "Uprawnienia uzytkownika do gniazda Docker (/var/run/docker.sock)" "docker ps"

# 5. Sprawdzenie statusu zapory sieciowej UFW
check_item "Aktywna zapora sieciowa UFW" "sudo ufw status | grep -qw 'active'"

# 6. Sprawdzenie reguly UFW dla portu 22 (SSH)
check_item "Port 22/tcp (SSH) w regułach UFW" "sudo ufw status | grep -E '^22/tcp\s+ALLOW'"

# 7. Sprawdzenie reguly UFW dla portu 80 (HTTP)
check_item "Port 80/tcp (HTTP) w regułach UFW" "sudo ufw status | grep -E '^80/tcp\s+ALLOW'"

# 8. Sprawdzenie reguly UFW dla portu 443 (HTTPS)
check_item "Port 443/tcp (HTTPS) w regułach UFW" "sudo ufw status | grep -E '^443/tcp\s+ALLOW'"

# 9. Sprawdzenie reguly UFW dla portu 3000 (Grafana)
check_item "Port 3000/tcp (Grafana) w regułach UFW" "sudo ufw status | grep -E '^3000/tcp\s+ALLOW'"

# 10. Sprawdzenie istnienia katalogu roboczego projektu
check_item "Katalog aplikacji (~/beauty-salon-app)" "test -d ~/beauty-salon-app || test -d /home/ubuntu/beauty-salon-app"

echo -e "\n${BLUE}----------------------------------------------------------------${NC}"
echo -e "${BLUE}Szczegoly srodowiska:${NC}"
echo -e "System operacyjny: $(lsb_release -d 2>/dev/null | cut -f2 || uname -sr)"
echo -e "Silnik Docker:     $(docker --version 2>/dev/null || echo 'Brak')"
echo -e "Docker Compose:    $(docker compose version 2>/dev/null || echo 'Brak')"
echo -e "Pamiec RAM:        $(free -h | awk '/^Mem:/ {print $3 "/" $2 " (Wolne: " $4 ")"}')"
echo -e "Dysk (Główny):     $(df -h / | awk 'NR==2 {print $3 "/" $2 " (Zajete: " $5 ", Wolne: " $4 ")"}')"
echo -e "${BLUE}----------------------------------------------------------------${NC}\n"

if [ $FAILED_COUNT -eq 0 ]; then
  echo -e "${GREEN}SUKCES: Wszystkie testy ($PASSED_COUNT/$PASSED_COUNT) zakonczone pomyslnie!${NC}"
  echo -e "${GREEN}Serwer jest w pelni gotowy do przyjecia deploymentu aplikacji.${NC}\n"
  exit 0
else
  echo -e "${RED}UWAGA: Wykryto $FAILED_COUNT niepowodzen na lacznie $((PASSED_COUNT + FAILED_COUNT)) testow.${NC}"
  echo -e "${YELLOW}Zalecane ponowne uruchomienie playbooka Ansible: ansible-playbook playbook.yml${NC}\n"
  exit 1
fi
