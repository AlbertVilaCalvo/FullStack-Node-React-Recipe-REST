#!/bin/bash

set -euo pipefail

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/../lib/common.sh"

# Load environment variables from root .env file
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
else
  log_error ".env file not found. Please run this script from the project root or ensure .env exists."
  exit 1
fi

log_info "Starting database seeding process..."
echo ""

if [ -z "$(docker compose ps --status running --quiet)" ]; then
  log_error "Docker Compose services are not running. Please start them first with:"
  echo "   docker compose up --build"
  exit 1
fi

if ! curl -s -f "http://localhost:${SERVER_PORT}/api/health" >/dev/null; then
  log_error "Server is not responding. Please ensure Docker Compose services are running and healthy."
  exit 1
fi

log_info "Creating user Albert (a@a.com)..."
http_code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${SERVER_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}')
if [ "${http_code}" -eq 201 ]; then
  log_info "User Albert created successfully"
  echo ""
else
  log_warn "User with email a@a.com may already exist"
fi

log_info "Creating user Blanca (b@b.com)..."
http_code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:${SERVER_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Blanca", "email":"b@b.com", "password":"123456"}')
if [ "${http_code}" -eq 201 ]; then
  log_info "User Blanca created successfully"
  echo ""
else
  log_warn "User with email b@b.com may already exist"
fi

log_info "Seeding recipe data..."

if docker compose exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" <server/database-seed.sql; then
  echo ""
  log_info "Database seeded successfully!"
  log_info "You can now:"
  echo "   - Visit http://localhost:${VITE_PORT} to see the web app"
  echo "   - Login with a@a.com / 123456 or b@b.com / 123456"
else
  log_error "Failed to seed database"
  exit 1
fi
