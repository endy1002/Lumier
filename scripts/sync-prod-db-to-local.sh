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

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required but not installed." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required but not installed." >&2
  exit 1
fi

if [[ -z "${PROD_DB_URL:-}" ]]; then
  echo "PROD_DB_URL is missing. Add it to environment or .env." >&2
  exit 1
fi

LOCAL_DB_URL="${LOCAL_DB_URL:-${DB_URL:-jdbc:postgresql://localhost:5432/lumier?sslmode=disable}}"
LOCAL_DB_USERNAME="${DB_USERNAME:-postgres}"
LOCAL_DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Convert Spring JDBC URL into libpq URL if needed.
if [[ "$LOCAL_DB_URL" == jdbc:postgresql://* ]]; then
  JDBC_NO_PREFIX="${LOCAL_DB_URL#jdbc:postgresql://}"

  # Keep query string if present.
  JDBC_HOST_DB="${JDBC_NO_PREFIX%%\?*}"
  JDBC_QUERY=""
  if [[ "$JDBC_NO_PREFIX" == *"?"* ]]; then
    JDBC_QUERY="?${JDBC_NO_PREFIX#*\?}"
  fi

  if [[ "$JDBC_HOST_DB" != *"/"* ]]; then
    echo "Invalid DB_URL format: $LOCAL_DB_URL" >&2
    exit 1
  fi

  LOCAL_DB_URL="postgresql://${LOCAL_DB_USERNAME}:${LOCAL_DB_PASSWORD}@${JDBC_HOST_DB}${JDBC_QUERY}"
fi

if [[ "$LOCAL_DB_URL" != postgresql://* && "$LOCAL_DB_URL" != postgres://* ]]; then
  echo "DB_URL must be a PostgreSQL URL. Current value: $LOCAL_DB_URL" >&2
  exit 1
fi

echo "This will overwrite your LOCAL database with PRODUCTION data."
echo "Source: PROD_DB_URL"
echo "Target: ${LOCAL_DB_URL}"
read -r -p "Continue? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
  echo "Cancelled."
  exit 0
fi

echo "Starting sync..."

# --clean + --if-exists ensures the local DB is replaced by prod state.
pg_dump "$PROD_DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --format=plain \
| psql "$LOCAL_DB_URL"

echo "Sync completed successfully."
