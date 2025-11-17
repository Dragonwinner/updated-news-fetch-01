# Deployment Guide - News Domain Generator

This guide provides step-by-step instructions for deploying the News Domain Generator system in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 20+ 
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)
- PM2 (for production process management)

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Critical settings
NODE_ENV=production
JWT_SECRET=<generate-strong-secret-key>
DB_PASSWORD=<strong-database-password>
SMTP_USER=<your-smtp-username>
SMTP_PASSWORD=<your-smtp-password>
```

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

```bash
# Using Docker Compose
docker-compose up -d postgres redis

# Or install PostgreSQL and Redis locally
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your local settings
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:all

# Or run separately:
npm run dev          # Frontend only (port 5173)
npm run dev:server   # Backend only (port 3001)
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- GraphQL: http://localhost:3001/graphql

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Build and Deploy with Docker Compose

```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

#### 2. Configure Production Environment

Edit `docker-compose.yml` environment variables or use a `.env` file:

```yaml
environment:
  NODE_ENV: production
  JWT_SECRET: ${JWT_SECRET}
  DB_PASSWORD: ${DB_PASSWORD}
  # ... other variables
```

### Option 2: Manual Deployment

#### 1. Build the Application

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

#### 2. Install Production Dependencies

```bash
npm ci --only=production
```

#### 3. Start with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. Configure Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # GraphQL
    location /graphql {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# t3.medium or larger recommended

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

#### 2. Setup RDS PostgreSQL

- Create RDS PostgreSQL instance
- Configure security groups
- Update `.env` with RDS endpoint

#### 3. Setup ElastiCache Redis

- Create ElastiCache Redis cluster
- Configure security groups
- Update `.env` with Redis endpoint

#### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-repo/news-domain-generator.git
cd news-domain-generator

# Configure environment
cp .env.example .env
# Edit .env with production values

# Deploy with Docker
docker-compose up -d
```

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=2
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build && npm run build:server`
   - Run Command: `node dist/server/index.js`
3. Add PostgreSQL and Redis managed databases
4. Set environment variables
5. Deploy

## Monitoring & Maintenance

### Health Checks

```bash
# Check API health
curl http://localhost:3001/api/health

# Check database connection
docker-compose exec postgres pg_isready

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# Docker logs
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# PM2 logs
pm2 logs news-domain-api

# System logs
journalctl -u news-domain-api
```

### Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres news_domain_db > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres news_domain_db < backup.sql

# Backup Redis
docker-compose exec redis redis-cli SAVE
docker cp news_domain_redis:/data/dump.rdb ./redis-backup.rdb
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Or with PM2
git pull origin main
npm run build
npm run build:server
pm2 restart news-domain-api
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d news_domain_db

# Check logs
docker-compose logs postgres
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping

# Check logs
docker-compose logs redis
```

### Application Not Starting

```bash
# Check environment variables
env | grep -E 'DB_|REDIS_|JWT_'

# Check port availability
netstat -tulpn | grep 3001

# Check application logs
pm2 logs news-domain-api --lines 100
```

### High Memory Usage

```bash
# Check Node.js memory
pm2 monit

# Restart with increased memory
pm2 delete news-domain-api
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
```

### Database Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Enable database encryption
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Use environment variables for secrets
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

## Performance Optimization

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_domains_available ON domains(available);
CREATE INDEX idx_domains_score ON domains(score);
CREATE INDEX idx_domains_generated_at ON domains(generated_at);

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Redis Caching

```javascript
// Cache frequently accessed data
await redis.setex('domain:popular', 3600, JSON.stringify(popularDomains));
```

### Load Balancing

```bash
# Scale with PM2
pm2 scale news-domain-api 4

# Or use multiple containers
docker-compose up -d --scale app=4
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com
