#!/usr/bin/env bash
set -euo pipefail

blue() { echo -e "\033[0;34m[INFO]\033[0m $*"; }
green() { echo -e "\033[0;32m[SUCCESS]\033[0m $*"; }
yellow(){ echo -e "\033[1;33m[WARNING]\033[0m $*"; }
red()   { echo -e "\033[0;31m[ERROR]\033[0m $*"; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "No se encontró el comando '$1'. Instálalo y vuelve a intentar."
    exit 1
  fi
}

start_containers() {
  # Crear .env si no existe
  if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
      blue "Creando .env desde [.env.example](.env.example)..."
      cp .env.example .env
      green ".env creado."
    else
      red "No existe .env ni .env.example. Crea tu .env y vuelve a ejecutar."
      exit 1
    fi
  else
    blue ".env ya existe."
  fi

  # Verificar que client y server existen
  if [[ ! -d "client" ]]; then
    red "La carpeta 'client' no existe. Asegúrate de que el repositorio esté completo."
    exit 1
  fi

  if [[ ! -d "server" ]]; then
    red "La carpeta 'server' no existe. Asegúrate de que el repositorio esté completo."
    exit 1
  fi

  # Exportar variables del .env (líneas KEY=VALUE sin comentarios)
  set -a
  # shellcheck disable=SC2046
  source <(grep -v '^\s*#' .env | sed 's/\r$//') || true
  set +a

  # Parar contenedores previos de este compose (no falla si no existen)
  blue "Deteniendo contenedores previos..."
  docker compose -f docker-compose.dev.yml down || true

  blue "Levantando contenedores de [docker-compose.dev.yml](docker-compose.dev.yml) para desarrollo local..."
  blue "Usando Dockerfile.dev para hot reload en desarrollo."
  docker compose -f docker-compose.dev.yml up --build -d

  # Esperar un momento para que los contenedores se inicien
  blue "Esperando a que los contenedores se inicien..."
  sleep 5

  # Preguntar si quiere ejecutar migraciones de Drizzle
  echo
  read -p "¿Quieres ejecutar migraciones de Drizzle? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    blue "Generando migraciones de Drizzle..."
    if docker compose -f docker-compose.dev.yml exec server bun run db:generate; then
      green "Migraciones generadas exitosamente."
      blue "Aplicando migraciones..."
      if docker compose -f docker-compose.dev.yml exec server bun run db:migrate; then
        green "Migraciones aplicadas exitosamente."
      else
        yellow "Error al aplicar migraciones. Puedes ejecutarlo manualmente con:"
        yellow "docker compose -f docker-compose.dev.yml exec server bun run db:migrate"
      fi
    else
      yellow "Error al generar migraciones. Puedes ejecutarlo manualmente con:"
      yellow "docker compose -f docker-compose.dev.yml exec server bun run db:generate"
    fi
  else
    blue "Omitiendo migraciones de la base de datos."
    blue "Puedes ejecutarlas más tarde con:"
    blue "  docker compose -f docker-compose.dev.yml exec server bun run db:generate"
    blue "  docker compose -f docker-compose.dev.yml exec server bun run db:migrate"
  fi

  # Mostrar logs en primer plano
  blue "Mostrando logs de los contenedores (Ctrl+C para salir)..."
  docker compose -f docker-compose.dev.yml logs -f
}

main() {
  cd "$ROOT_DIR"

  blue "Verificando dependencias..."
  require_cmd git
  require_cmd docker
  # Verificar plugin docker compose
  if ! docker compose version >/dev/null 2>&1; then
    red "Se requiere 'docker compose' (plugin). Instálalo y vuelve a intentar."
    exit 1
  fi

  start_containers
}

main "$@"