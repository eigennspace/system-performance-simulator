#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="system-performance-simulator"

usage() {
  cat <<HELP
Usage: ./scripts/docker-deploy.sh <command>

Commands:
  up        Build and start containers in detached mode
  rebuild   Force rebuild and restart containers
  down      Stop and remove containers
  restart   Restart running containers
  logs      Tail container logs
  status    Show running services
  health    Check app health endpoint
HELP
}

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed or not in PATH" >&2
  exit 1
fi

cmd="${1:-}"

case "$cmd" in
  up)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
    ;;
  rebuild)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --force-recreate
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    ;;
  restart)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" restart
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f --tail=200
    ;;
  status)
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    ;;
  health)
    curl -fsS http://localhost:4300/health && echo
    ;;
  *)
    usage
    exit 1
    ;;
esac
