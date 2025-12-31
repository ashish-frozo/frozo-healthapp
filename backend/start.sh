#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔄 Running database migrations..."
MAX_RETRIES=5
RETRY_COUNT=0

until npx prisma migrate deploy || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "Migration failed, retrying in 5 seconds... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to run migrations after $MAX_RETRIES attempts"
  echo "⚠️  Starting server anyway (migrations may need to be run manually)"
fi

echo "🌱 Seeding database (if needed)..."
npx prisma db seed || echo "Seeding skipped or failed"

echo "🚀 Starting server..."
exec node dist/index.js
