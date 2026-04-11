#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_ENV_FILE="$ROOT_DIR/.env"
BACKEND_ENV_FILE="$ROOT_DIR/backend/.env"

if [[ -f "$ROOT_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_ENV_FILE"
  set +a
fi

if [[ -f "$BACKEND_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$BACKEND_ENV_FILE"
  set +a
fi

if [[ -z "${GOOGLE_CLIENT_ID:-}" && -n "${VITE_GOOGLE_CLIENT_ID:-}" ]]; then
  export GOOGLE_CLIENT_ID="$VITE_GOOGLE_CLIENT_ID"
fi

if [[ -z "${GOOGLE_CLIENT_ID:-}" ]]; then
  echo "GOOGLE_CLIENT_ID is missing. Set it in environment or .env (VITE_GOOGLE_CLIENT_ID)." >&2
  exit 1
fi

exec mvn -f "$ROOT_DIR/backend/pom.xml" spring-boot:run
