# Production Database Migration Guide

This guide covers the deployment and migration process for the Frozo Health App database.

## Prerequisites

- PostgreSQL 15+ database instance
- Node.js 20+ installed
- Access to production environment variables

## Environment Variables

Ensure these are set in your production `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
JWT_SECRET="your-secure-random-secret"
SENTRY_DSN="your-sentry-dsn"
ALLOWED_ORIGINS="https://yourdomain.com"
NODE_ENV="production"
```

## Migration Steps

### 1. Deploy Migrations

Run the following command to apply all pending migrations:

```bash
npx prisma migrate deploy
```

This command:
- Applies all pending migrations to the database
- Does NOT create new migrations (use `prisma migrate dev` for that in development)
- Is safe to run multiple times

### 2. Seed the Database (Optional)

To populate the database with initial data:

```bash
npx prisma db seed
```

> **Note:** Only run seeding once on initial setup or in staging environments.

### 3. Generate Prisma Client

After migrations, regenerate the Prisma client:

```bash
npx prisma generate
```

## Rollback Strategy

To rollback a migration, you'll need to manually create a down migration. Prisma doesn't support automatic rollbacks.

1. Create a new migration with the rollback SQL
2. Apply it using `prisma migrate deploy`

## Health Check

After deployment, verify the database connection by hitting:

```
GET /health
```

This should return `{"status": "ok"}`.

## Troubleshooting

### Connection Issues
- Verify `DATABASE_URL` is correct
- Check network/firewall rules
- Ensure the database user has proper permissions

### Migration Conflicts
- Never modify existing migrations
- Create new migrations for schema changes
- In emergencies, use `prisma migrate resolve` to mark migrations as applied/rolled-back
