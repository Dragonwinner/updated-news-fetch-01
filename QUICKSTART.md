# Quick Start Guide

Get the News Domain Generator up and running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Docker Desktop installed and running

## Option 1: Docker (Recommended - 2 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Dragonwinner/updated-news-fetch-01.git
cd updated-news-fetch-01

# 2. Start all services with Docker
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
# GraphQL: http://localhost:3001/graphql
```

That's it! The application is now running.

## Option 2: Local Development (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Dragonwinner/updated-news-fetch-01.git
cd updated-news-fetch-01

# 2. Install dependencies
npm install

# 3. Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# 4. Copy environment configuration
cp .env.example .env

# 5. Start both frontend and backend
npm run dev:all

# 6. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api
```

## First Steps

### 1. Create an Account

1. Open http://localhost:5173
2. Click "Sign In" button in the top right
3. Click "Don't have an account? Sign up"
4. Fill in your details and register

### 2. Explore Generated Domains

The system automatically:
- Fetches news every hour from major tech news sources
- Extracts keywords from articles
- Generates domain suggestions
- Scores and ranks domains

Browse the automatically generated domains on the home page!

### 3. Configure TLDs

Default TLDs: `.com`, `.co`, `.io`, `.ai`, `.net`

To add more TLDs, update `.env`:
```bash
CONFIGURABLE_TLDS=.com,.co,.io,.ai,.net,.tech,.dev
```

### 4. Test GraphQL API

Open http://localhost:3001/graphql and try:

```graphql
query {
  domains(limit: 5) {
    domains {
      name
      tld
      available
      score
    }
  }
}
```

### 5. Test Real-time WebSocket

Connect to `ws://localhost:3001/ws?token=YOUR_JWT_TOKEN`

You'll receive real-time updates when new domains are generated!

## Common Commands

```bash
# Start everything
npm run dev:all

# Start only frontend
npm run dev

# Start only backend
npm run dev:server

# Build for production
npm run build
npm run build:server

# Run linter
npm run lint

# View logs (Docker)
docker-compose logs -f app

# Stop everything (Docker)
docker-compose down
```

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database connection error

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL is running
docker-compose ps postgres
```

### Redis connection error

```bash
# Restart Redis
docker-compose restart redis

# Check Redis is running
docker-compose ps redis
```

## What's Next?

- Read the full [README.md](README.md) for detailed features
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore the GraphQL API at http://localhost:3001/graphql
- Set up email notifications in `.env`
- Configure hourly cron jobs for 24/7 operation

## Need Help?

- Check the [README.md](README.md) for comprehensive documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- Open an issue on GitHub

Happy domain hunting! 🚀
