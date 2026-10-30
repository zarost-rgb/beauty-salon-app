# Bellezza Studio — Beauty Salon App

> Kompleksowy projekt aplikacji salonu urody i spa przygotowany w ramach projektu dyplomowego DevOps (AWS, Docker, CI/CD GitHub Actions, Prometheus, Grafana).

[![Node.js Tests](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-336791.svg)](https://www.postgresql.org/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639.svg)](https://nginx.org/)
[![Monitoring](https://img.shields.io/badge/Prometheus-Metrics%20Ready-e6522c.svg)](https://prometheus.io/)

---

## 1. Architektura Systemu

Aplikacja oparta jest na nowoczesnej, skonteneryzowanej architekturze modularnej:

```mermaid
graph TD
    User["Przeglądarka / Klient"] -->|Port 80| Gateway["Nginx Reverse Proxy & Gateway"]
    
    subgraph DockerNetwork["Docker Network: beauty-network"]
        Gateway -->|"GET /"| Frontend["Frontend SPA (Nginx Alpine)"]
        Gateway -->|"GET /api/*, POST /api/*, GET /health, GET /metrics"| Backend["Backend REST API (Node.js 20 Express)"]
        Backend -->|"Port 5432"| DB[("Baza Danych PostgreSQL 16 Alpine")]
        DB --- Volume[("Wolumen: postgres_data")]
    end
```

### Komponenty Aplikacji:
1. **Frontend SPA (`frontend/`)**: Estetyczny, responsywny interfejs dla salonu urody („Bellezza Studio”) zrealizowany w HTML5 + Tailwind CSS z dynamicznym cennikiem usług, panelem rezerwacji wizyt online oraz podglądem harmonogramu. Serwowany przez lekki kontener `nginx:alpine` z kompresją gzip.
2. **Backend REST API (`backend/`)**: Skalowalny mikroserwis w Node.js/Express:
   - Pula połączeń z PostgreSQL (`pg`).
   - Endpoint `/health` weryfikujący stan procesu oraz aktywne połączenie z bazą (zwraca kod 200 lub 503 pod weryfikację CI/CD po wdrożeniu).
   - Endpoint `/metrics` dla Prometheusa (`prom-client`).
   - Bezpieczeństwo i nagłówki HTTP (`helmet`, `cors`).
   - Konteneryzacja multi-stage build z nieuprzywilejowanym użytkownikiem `node`.
3. **Baza Danych (`db/`)**: PostgreSQL 16 Alpine z automatyczną inicjalizacją schematu (`init.sql`), relacjami (`services`, `appointments`), indeksami oraz danymi początkowymi (5 usług w języku polskim). Trwałość danych gwarantowana przez wolumen Dockera.
4. **Nginx Reverse Proxy / API Gateway (`nginx/`)**: Pojedynczy punkt wejścia do aplikacji na porcie 80, kierujący ruch do frontendu i backendu, przygotowany na horyzontalne skalowanie kontenerów backendu (`upstream backend_servers`).

---

## 2. Struktura Katalogów

```
beauty-salon-app/
├── .env.example              # Wzór zmiennych środowiskowych
├── .env                      # Aktywne zmienne środowiskowe
├── .gitignore                # Wykluczenia z repozytorium Git (Terraform, Ansible, .env)
├── docker-compose.yml        # Orkiestracja kontenerów aplikacji (db, backend, frontend, proxy)
├── PLAN_PROJEKTU.md          # Pełny plan techniczny projektu dyplomowego
├── WYMAGANIA_PROJEKTU.md     # Macierz zgodności z wymaganiami formalnymi
├── .github/
│   └── workflows/
│       ├── ci.yml            # Pipeline CI: testy i walidacja Docker na gałęziach funkcyjnych
│       └── deploy.yml        # Pipeline CD: publikacja GHCR, SSH deploy na AWS, Telegram, Email
├── terraform/                # Infrastruktura jako Kod (AWS Cloud)
│   ├── provider.tf           # Konfiguracja dostawcy AWS
│   ├── network.tf            # Dedykowane VPC, podsieć publiczna, brama IGW i routing
│   ├── security.tf           # Reguły zapory sieciowej AWS Security Group
│   ├── compute.tf            # Definicja instancji EC2, dysk EBS GP3 i klucz SSH
│   ├── variables.tf          # Definicje zmiennych wejściowych
│   ├── terraform.tfvars      # Aktywna konfiguracja parametrów dla wdrożenia
│   ├── terraform.tfvars.example # Wzór pliku zmiennych dla repozytorium Git
│   └── outputs.tf            # Wyjścia: publiczny IP, komenda SSH, rekord inwentarza Ansible
├── ansible/                  # Zarządzanie konfiguracją systemu operacyjnego (AWS EC2)
│   ├── ansible.cfg           # Konfiguracja Ansible (pipelining, użytkownik ubuntu)
│   ├── inventory.ini         # Aktywny inwentarz z adresem serwera AWS
│   ├── inventory.ini.example # Wzór pliku inwentarza dla repozytorium
│   ├── playbook.yml          # Playbook: instalacja Docker CE, Compose, reguły UFW
│   └── verify_server.sh      # Skrypt weryfikacji gotowości serwera przed komisją
├── monitoring/               # Stos Obserwowalności (Observability Stack)
│   ├── docker-compose.monitoring.yml # Orkiestracja Prometheus, Grafana, Loki, cAdvisor
│   ├── prometheus.yml        # Konfiguracja zbierania metryk (scraping)
│   ├── loki/
│   │   └── loki-config.yml   # Konfiguracja magazynu logów Grafana Loki
│   ├── promtail/
│   │   └── promtail-config.yml # Konfiguracja agenta przekazywania logów do Loki
│   └── grafana/
│       ├── dashboards/
│       │   └── beauty_salon_dashboard.json # Gotowy, predefiniowany dashboard
│       └── provisioning/     # Automatyczny provisioning źródeł (Prometheus, Loki) i dashboardów
├── backend/
│   ├── Dockerfile            # Multi-stage Dockerfile (Node.js 20 Alpine)
│   ├── .dockerignore
│   ├── package.json          # Zależności i skrypty (npm test, npm start)
│   ├── src/
│   │   ├── app.js            # Konfiguracja Express i middleware
│   │   ├── server.js         # Uruchomienie serwera i graceful shutdown
│   │   ├── db.js             # Pula połączeń i healthcheck PostgreSQL
│   │   ├── middleware/
│   │   │   └── metrics.js    # Zbieranie metryk Prometheus (prom-client)
│   │   └── routes/
│   │       ├── health.js     # Endpointy /health oraz /health/live
│   │       ├── services.js   # Katalog usług (/api/services)
│   │       └── appointments.js # Rezerwacje wizyt (/api/appointments)
│   └── tests/
│       ├── health.test.js    # Testy jednostkowe endpointu /health i metryk
│       └── api.test.js       # Testy integracyjne API usług i rezerwacji
├── frontend/
│   ├── Dockerfile            # Konteneryzacja Nginx Alpine
│   ├── .dockerignore
│   ├── nginx.conf            # Konfiguracja serwowania SPA i kompresji gzip
│   └── src/
│       ├── index.html        # Główny interfejs salonu Bellezza Studio
│       ├── styles.css        # Dodatkowe style, animacje i toasty
│       └── app.js            # Dynamiczne pobieranie usług i rezerwacja wizyt
├── nginx/
│   ├── Dockerfile            # Obraz Reverse Proxy Gateway
│   └── default.conf          # Konfiguracja routingu i load balancingu
├── db/
│   └── init.sql              # Skrypt inicjalizujący schemat bazy i dane początkowe
└── docs/                     # Kompletna dokumentacja techniczna i przewodnik obrony
    ├── ARCHITEKTURA.md       # Trójwarstwowa architektura logiczna, sieciowa i bezpieczeństwa
    ├── IAC_AWS.md            # Wdrożenie infrastruktury AWS od zera (Terraform + Ansible)
    ├── CICD_PIPELINE.md      # Przepływ CI/CD w GitHub Actions, sekrety, bot Telegram
    ├── MONITORING_I_LOGI.md  # Metryki Prometheus, zapytania PromQL/LogQL, panele Grafana
    └── INSTRUKCJA_OBRONY.md  # Przewodnik demonstracji projektu i pytania komisji (Q&A)
```

---

## 3. Kompletna Dokumentacja Techniczna (Katalog `docs/`)

Projekt zawiera kompletną, wyczerpującą dokumentację inżynierską w języku polskim przygotowaną z myślą o obronie dyplomowej:

| Dokument | Ścieżka | Zakres tematyczny |
| :--- | :--- | :--- |
| **Architektura Systemu** | [`docs/ARCHITEKTURA.md`](docs/ARCHITEKTURA.md) | Opis warstw logicznych, sieci VPC, topologii Docker, modelu bezpieczeństwa i diagramów. |
| **Infrastruktura AWS (IaC)** | [`docs/IAC_AWS.md`](docs/IAC_AWS.md) | Powołanie chmury krok po kroku za pomocą Terraform i konfiguracja hosta w Ansible. |
| **Potok CI/CD** | [`docs/CICD_PIPELINE.md`](docs/CICD_PIPELINE.md) | Opis workflow GitHub Actions, konfiguracja sekretów, bot Telegram i powiadomienia e-mail. |
| **Monitoring i Logi** | [`docs/MONITORING_I_LOGI.md`](docs/MONITORING_I_LOGI.md) | Metryki systemowe i aplikacyjne, prom-client, zapytania PromQL, przeszukiwanie logów LogQL. |
| **Przewodnik Obrony** | [`docs/INSTRUKCJA_OBRONY.md`](docs/INSTRUKCJA_OBRONY.md) | Scenariusz 15-minutowej prezentacji na żywo, harmonogram oraz gotowe odpowiedzi na pytania komisji. |

---

## 4. Szybkie Uruchomienie (Quick Start)

### Wymagania wstępne:
- Zainstalowany `docker` oraz `docker compose` (lub `docker-compose`).
- Port `80` dostępny na maszynie (konfigurowalny przez zmienną `APP_PORT` w `.env`).

### Krok 1: Klonowanie i konfiguracja zmiennych
```bash
git clone https://github.com/twoj-login/beauty-salon-app.git
cd beauty-salon-app
cp .env.example .env
```

### Krok 2: Uruchomienie całej aplikacji za pomocą Docker Compose
```bash
docker compose up -d --build
```

Sprawdzenie statusu kontenerów:
```bash
docker compose ps
```

### Krok 3: (Opcjonalnie) Uruchomienie stosu monitoringu (Prometheus, Grafana, Loki)
```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

### Krok 4: Dostęp w przeglądarce
* **Aplikacja Salonu Urody (Frontend)**: `http://localhost/`
* **Pulpit Monitoringu Grafana**: `http://localhost:3000` (login: `admin`, hasło: `admin`)
* **Healthcheck aplikacji**: `http://localhost/health`
* **Metryki Prometheus**: `http://localhost/metrics`
* **API Usług**: `http://localhost/api/services`
* **API Rezerwacji**: `http://localhost/api/appointments`

---

## 5. Testy Jednostkowe i Integracyjne (CI/CD Ready)

Testy backendu nie wymagają działającej bazy danych (wykorzystują mockowanie modułu bazy za pomocą `jest` i `supertest`), co umożliwia błyskawiczne i niezależne wykonanie w pipeline CI/CD na dowolnej maszynie.

```bash
cd backend
npm test
```

Wynik testów:
```text
PASS tests/api.test.js
PASS tests/health.test.js

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
```

---

## 6. Kluczowe Endpointy REST API

| Metoda | Ścieżka | Opis | Przykładowa odpowiedź / Kod |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Weryfikacja stanu procesu oraz aktywnego połączenia z PostgreSQL | `200 OK` (`{"status":"UP","database":"connected"}`) lub `503` |
| `GET` | `/health/live` | Sonda liveness dla orkiestratora | `200 OK` (`{"status":"UP"}`) |
| `GET` | `/metrics` | Metryki systemowe i aplikacyjne dla Prometheusa | `200 OK` (Format Prometheus text) |
| `GET` | `/api/services` | Lista dostępnych usług w salonie | `200 OK` (JSON z listą 5 predefiniowanych usług) |
| `GET` | `/api/services/:id` | Szczegóły pojedynczej usługi | `200 OK` / `404 Not Found` |
| `GET` | `/api/appointments` | Lista zarezerwowanych wizyt z powiązaną usługą | `200 OK` (JSON) |
| `POST` | `/api/appointments` | Utworzenie nowej rezerwacji wizyty online | `201 Created` / `400 Bad Request` |
| `DELETE` | `/api/appointments/:id` | Anulowanie wizyty | `200 OK` / `404 Not Found` |

---

## 7. Zatrzymanie Aplikacji

```bash
docker compose down
docker compose -f monitoring/docker-compose.monitoring.yml down
```

W celu usunięcia wolumenów z danymi bazy i monitoringu:
```bash
docker compose down -v
docker compose -f monitoring/docker-compose.monitoring.yml down -v
```
