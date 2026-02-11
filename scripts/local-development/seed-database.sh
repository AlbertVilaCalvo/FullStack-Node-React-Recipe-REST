#!/bin/bash

set -e # Exit on any error

# Load environment variables from root .env file
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
else
  echo "❌ .env file not found. Please run this script from the project root or ensure .env exists."
  exit 1
fi

echo -e "🌱 Starting database seeding process...\n"

if ! docker compose ps | grep -q "Up"; then
  echo "❌ Docker Compose services are not running. Please start them first with:"
  echo "   docker compose up --build"
  exit 1
fi

if ! curl -s -f "http://localhost:${SERVER_PORT}/api/health" >/dev/null; then
  echo "❌ Server is not responding. Please ensure Docker Compose services are running and healthy."
  exit 1
fi

echo "👤 Creating user Albert (a@a.com)..."
curl -s -X POST "http://localhost:${SERVER_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}' \
  | grep -q "token" && echo -e "✅ User Albert created successfully\n" || echo "⚠️ User with email a@a.com may already exist"

echo "👤 Creating user Blanca (b@b.com)..."
curl -s -X POST "http://localhost:${SERVER_PORT}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Blanca", "email":"b@b.com", "password":"123456"}' \
  | grep -q "token" && echo -e "✅ User Blanca created successfully\n" || echo "⚠️ User with email b@b.com may already exist"

echo "🍳 Seeding recipe data..."

if docker compose exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" <server/database-seed.sql; then
  echo -e "\n✅ Database seeded successfully!"
  echo "🎉 You can now:"
  echo "   - Visit http://localhost:${VITE_PORT} to see the web app"
  echo "   - Login with a@a.com / 123456 or b@b.com / 123456"
else
  echo "❌ Failed to seed database"
  exit 1
fi
