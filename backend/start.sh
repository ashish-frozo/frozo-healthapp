#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
npx prisma db seed || echo "Seeding skipped or failed"

echo "🚀 Starting server..."
exec node dist/index.js
