# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  React Frontend  │              │   Mobile App     │        │
│  │   (Port 5173)    │              │   (Future)       │        │
│  │                  │              │                  │        │
│  │  - Components    │              │  - React Native  │        │
│  │  - Zustand Store │              │  - Push Notifs   │        │
│  │  - Auth Modal    │              │                  │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼───────────────────┘
            │                                  │
            └──────────────┬───────────────────┘
                           │
                           │ HTTP/HTTPS
                           │ WebSocket
                           │
┌───────────────────────────▼───────────────────────────────────────┐
│                      API Gateway / Load Balancer                   │
│                         (Nginx / AWS ALB)                          │
└───────────────────────────┬───────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
┌───────────▼─────┐ ┌──────▼──────┐ ┌────▼──────────┐
│  Express Server │ │Express Srvr │ │ Express Srvr  │
│   Instance 1    │ │ Instance 2  │ │  Instance N   │
│  (Port 3001)    │ │ (Port 3002) │ │  (Port 300N)  │
└───────────┬─────┘ └──────┬──────┘ └────┬──────────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────────┐
│                     Application Layer                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │  REST API   │  │  GraphQL    │  │  WebSocket  │               │
│  │             │  │   (Apollo)  │  │   Server    │               │
│  │  /api/*     │  │  /graphql   │  │   /ws       │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
│         │                │                │                        │
│         └────────────────┼────────────────┘                        │
│                          │                                         │
│  ┌───────────────────────▼──────────────────────────┐            │
│  │          Middleware Layer                         │            │
│  │  - Authentication (JWT)                           │            │
│  │  - Rate Limiting                                  │            │
│  │  - CORS                                           │            │
│  │  - Helmet (Security Headers)                      │            │
│  │  - Compression                                    │            │
│  └───────────────────────┬──────────────────────────┘            │
│                          │                                         │
│  ┌───────────────────────▼──────────────────────────┐            │
│  │          Business Logic Layer                     │            │
│  │                                                   │            │
│  │  ┌─────────────────┐  ┌─────────────────┐       │            │
│  │  │ Auth Service    │  │ Domain Service  │       │            │
│  │  │ - Register      │  │ - Generate      │       │            │
│  │  │ - Login         │  │ - Score         │       │            │
│  │  │ - JWT Tokens    │  │ - Check Avail   │       │            │
│  │  └─────────────────┘  └─────────────────┘       │            │
│  │                                                   │            │
│  │  ┌─────────────────┐  ┌─────────────────┐       │            │
│  │  │ News Service    │  │ Email Service   │       │            │
│  │  │ - Fetch RSS     │  │ - Send Alerts   │       │            │
│  │  │ - Extract Keys  │  │ - Welcome Email │       │            │
│  │  │ - Process       │  │ - Notifications │       │            │
│  │  └─────────────────┘  └─────────────────┘       │            │
│  │                                                   │            │
│  │  ┌─────────────────┐  ┌─────────────────┐       │            │
│  │  │ Analytics Svc   │  │ A/B Test Svc    │       │            │
│  │  │ - Track Events  │  │ - Create Tests  │       │            │
│  │  │ - Metrics       │  │ - Get Variant   │       │            │
│  │  │ - Reports       │  │ - Track Conv    │       │            │
│  │  └─────────────────┘  └─────────────────┘       │            │
│  └───────────────────────────────────────────────────┘            │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
┌───────────▼──────┐ ┌────────▼────────┐ ┌────▼──────────────┐
│   PostgreSQL     │ │     Redis       │ │  Cron Scheduler   │
│   Database       │ │     Cache       │ │                   │
│  (Port 5432)     │ │  (Port 6379)    │ │  - Hourly Jobs    │
│                  │ │                 │ │  - Domain Gen     │
│  ┌────────────┐  │ │  ┌───────────┐  │ │  - News Fetch     │
│  │ Users      │  │ │  │ Sessions  │  │ └───────────────────┘
│  │ Domains    │  │ │  │ Cache     │  │
│  │ NewsArticle│  │ │  │ Analytics │  │
│  │ UserAlerts │  │ │  │ AB Tests  │  │
│  │ Analytics  │  │ │  └───────────┘  │
│  │ ABTests    │  │ │                 │
│  └────────────┘  │ └─────────────────┘
└──────────────────┘
```

## Data Flow

### 1. User Registration/Login Flow
```
User → React → POST /api/auth/register → Auth Service → Hash Password
                                                ↓
                                           Create User (PostgreSQL)
                                                ↓
                                           Generate JWT Token
                                                ↓
                                           Return Token + User
                                                ↓
                                           Store in localStorage
                                                ↓
                                           Connect WebSocket
```

### 2. Domain Generation Flow (Hourly)
```
Cron Job (Every Hour)
    ↓
News Service → Fetch RSS Feeds (BBC, Wired, TechCrunch)
    ↓
Parse & Extract Keywords
    ↓
Store in NewsArticle Table
    ↓
Domain Service → Generate Domain Combinations
    ↓
Calculate Scores (Length, Memorability, etc.)
    ↓
Store in Domain Table (PostgreSQL)
    ↓
Notify via WebSocket → All Connected Clients
    ↓
Check User Alerts → Send Email Notifications
```

### 3. Real-time Updates Flow
```
Domain Created/Updated
    ↓
WebSocket Service → Broadcast to All Clients
    ↓
React Client Receives → Update UI Immediately
    ↓
Show Notification/Toast
```

### 4. Analytics Tracking Flow
```
User Action (e.g., View Domain)
    ↓
Track Event API Call
    ↓
Analytics Service
    ├── Store in PostgreSQL (Long-term)
    └── Update Redis Counters (Real-time)
    ↓
Dashboard Queries → Aggregate from Both Sources
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Network Layer                                        │
│     - HTTPS/TLS Encryption                               │
│     - Firewall Rules                                     │
│     - DDoS Protection                                    │
│                                                           │
│  2. Application Layer                                    │
│     - Helmet (Security Headers)                          │
│     - CORS Configuration                                 │
│     - Rate Limiting (100 req/15min)                      │
│     - Input Validation                                   │
│                                                           │
│  3. Authentication Layer                                 │
│     - JWT Tokens (Expiry: 24h)                           │
│     - Password Hashing (bcrypt, 10 rounds)               │
│     - Role-Based Access Control                          │
│     - Token Refresh Mechanism                            │
│                                                           │
│  4. Data Layer                                           │
│     - SQL Injection Prevention (Sequelize ORM)           │
│     - Encrypted Database Connections                     │
│     - Sensitive Data Encryption                          │
│     - Regular Backups                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Scaling Strategy

### Horizontal Scaling
```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐ ┌─────▼─────┐
        │ Server 1  │  │ Server 2  │ │ Server N  │
        │ (PM2)     │  │ (PM2)     │ │ (PM2)     │
        └─────┬─────┘  └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼──────┐ ┌────▼──────┐ ┌─────▼──────┐
        │ PostgreSQL │ │   Redis   │ │   Redis    │
        │  Primary   │ │  Primary  │ │  Replica   │
        └────────────┘ └───────────┘ └────────────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │
        │   Replica  │
        │ (Read-Only)│
        └────────────┘
```

### Database Optimization
- Connection Pooling: 50 max connections
- Read Replicas: Distribute read load
- Indexes on frequently queried columns
- Query optimization with EXPLAIN ANALYZE
- Partitioning for large tables (future)

### Caching Strategy
- Redis for session storage
- Cache frequently accessed domains
- Cache analytics counters
- Cache TLD configurations
- TTL-based invalidation

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────┐
│                 Monitoring Stack                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Application Metrics                                 │
│  - Response Times                                    │
│  - Error Rates                                       │
│  - Request Volume                                    │
│  - Active Users                                      │
│                                                       │
│  Infrastructure Metrics                              │
│  - CPU Usage                                         │
│  - Memory Usage                                      │
│  - Disk I/O                                          │
│  - Network Traffic                                   │
│                                                       │
│  Database Metrics                                    │
│  - Query Performance                                 │
│  - Connection Pool                                   │
│  - Slow Queries                                      │
│  - Table Sizes                                       │
│                                                       │
│  Business Metrics                                    │
│  - Domains Generated                                 │
│  - User Registrations                                │
│  - Active Users                                      │
│  - API Usage                                         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Deployment Environments

### Development
- Local Docker Compose
- Hot reload enabled
- Debug logging
- Mock email service

### Staging
- Cloud-hosted (AWS/Heroku)
- Production-like data
- Integration tests
- Performance testing

### Production
- Multi-region deployment
- Auto-scaling enabled
- CDN for static assets
- Monitoring & alerting
- Automated backups
- Disaster recovery plan

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 20, Express 5, TypeScript |
| Database | PostgreSQL 16 + Sequelize ORM |
| Cache | Redis 7 + ioredis |
| API | REST + GraphQL (Apollo Server) |
| Real-time | WebSocket (ws) |
| Auth | JWT + bcrypt |
| Email | Nodemailer |
| Cron | node-cron |
| Container | Docker + Docker Compose |
| Process Manager | PM2 |
| Reverse Proxy | Nginx (production) |

---

For more details, see:
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guides
- [API.md](API.md) - API reference
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
