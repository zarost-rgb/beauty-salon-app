# Wymagania Projektu Dyplomowego - DevOps (Beauty Salon App)

Poniższy dokument przedstawia pełne zestawienie oficjalnych wymagań projektu dyplomowego wraz ze statusem ich realizacji w niniejszym repozytorium.

---

## 1. Główne Cele Projektu

| Wymaganie | Opis | Status |
| :--- | :--- | :---: |
| **Wybór Repozytorium** | Wybór lub przygotowanie kodu źródłowego aplikacji (mono- lub mikroserwisowej). | :white_check_mark: Realizowane |
| **Automatyzacja Infrastruktury (IaC)** | Zautomatyzowanie procesu tworzenia infrastruktury pod wdrożenie projektu (idempotentna, od zera). | :white_check_mark: Realizowane |
| **Automatyzacja CI/CD** | Zautomatyzowanie procesów ciągłej integracji i ciągłego dostarczania. | :white_check_mark: Realizowane |
| **Monitoring** | Konfiguracja monitoringu dla infrastruktury oraz aplikacji. | :white_check_mark: Realizowane |

---

## 2. Kryteria Zaliczenia (Warunki Konieczne)

* [x] **Dokumentacja**: Repozytorium zawiera kompletną dokumentację w języku polskim opisującą jego zawartość, architekturę oraz procesy budowania i wdrażania (`README.md`, `docs/*`).
* [x] **Infrastruktura jako Kod (IaC)**: Infrastruktura wdrożona w AWS za pomocą **Terraform** i **Ansible** od zera przy użyciu minimalnej liczby komend, z zachowaniem pełnej idempotencji.
* [x] **Procesy CI/CD (Dowolna gałąź)**:
  * :white_check_mark: Budowanie aplikacji (Docker multi-stage)
  * :white_check_mark: Publikacja artefaktów w repozytorium (GHCR / Docker Hub)
* [x] **Procesy CI/CD (Gałąź `main`)**:
  * :white_check_mark: Budowanie aplikacji
  * :white_check_mark: Publikacja artefaktu
  * :white_check_mark: Automatyczne wdrożenie (deployment) na docelową infrastrukturę AWS EC2
* [x] **Powiadomienia**: System wysyła automatyczne powiadomienia o wyniku budowania i wdrożenia na komunikator **Telegram** oraz na **E-mail**.

---

## 3. Zrealizowane Opcjonalne Ulepszenia (Bonusy dla Komisji)

* :white_check_mark: **Konteneryzacja**: Docker + Docker Compose, zoptymalizowane obrazy Alpine, multi-stage build.
* :white_check_mark: **Skalowalność & Load Balancer**: Nginx jako Reverse Proxy, możliwość skalowania replik backendu.
* :white_check_mark: **Agregacja Logów**: Zintegrowany centralny stos zbierania logów **Grafana Loki + Promtail**.
* :white_check_mark: **Monitoring**: **Prometheus** (metryki hosta i kontenerów przez Node Exporter i cAdvisor) + **Grafana** z interaktywnymi pulpitami nawigacyjnymi.
* :white_check_mark: **Healthchecki**: Automatyczna weryfikacja stanu działania aplikacji (`/health`) w pipeline po deploymentcie.
* :white_check_mark: **Przewodnik Obrony**: Gotowy scenariusz wystąpienia i demonstracji przed komisją (`docs/INSTRUKCJA_OBRONY.md`).
