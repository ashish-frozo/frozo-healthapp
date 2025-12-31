# Railway Deployment Guide

This guide covers deploying the Frozo Health App to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Railway CLI (optional): `npm install -g @railway/cli`

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Empty Project**
3. Name it `frozo-healthapp`

## Step 2: Add PostgreSQL Database

1. In your project, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway will provision the database and set `DATABASE_URL` automatically

## Step 3: Deploy Backend

1. Click **+ New** → **GitHub Repo**
2. Select your repository
3. Configure:
   - **Root Directory**: `backend`
   - **Watch Patterns**: `backend/**`

### Backend Environment Variables

Add these in the **Variables** tab:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (auto-linked from PostgreSQL) |
| `JWT_SECRET` | `your-secure-random-secret-min-32-chars` |
| `GEMINI_API_KEY` | `your-google-ai-api-key` |
| `ALLOWED_ORIGINS` | `https://your-frontend.railway.app` |
| `NODE_ENV` | `production` |
| `SENTRY_DSN` | (optional) `your-sentry-dsn` |

## Step 4: Deploy Frontend

1. Click **+ New** → **GitHub Repo**
2. Select the same repository
3. Configure:
   - **Root Directory**: `/` (root)
   - **Watch Patterns**: `src/**,public/**`

### Frontend Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.railway.app/api` |
| `VITE_SOCKET_URL` | `https://your-backend.railway.app` |
| `VITE_SENTRY_DSN` | (optional) |

## Step 5: Link Services

1. Go to the PostgreSQL service
2. Click **Variables** → **Reference**
3. In Backend service, add reference to `DATABASE_URL`

## Step 6: Verify Deployment

### Health Check
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "ok",
  "uptime": "0h 5m 30s",
  "version": "1.0.0"
}
```

### API Documentation
Visit: `https://your-backend.railway.app/api-docs`

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`

### Database Connection
- Verify `DATABASE_URL` is correctly linked
- Check PostgreSQL service is running

### CORS Errors
- Update `ALLOWED_ORIGINS` with your frontend URL
- Include both `https://` and `http://` if needed

## Useful Commands

```bash
# Railway CLI login
railway login

# Link to project
railway link

# View logs
railway logs

# Open deployed app
railway open
```
