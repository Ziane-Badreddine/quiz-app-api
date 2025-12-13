#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for postgres to be ready
while ! nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - connecting..."

# Wait a bit more to ensure postgres is fully ready
sleep 2

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting application..."
exec "$@"