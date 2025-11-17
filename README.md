# News Domain Generator - Enterprise Edition

A full-stack application that generates domain name suggestions from daily news articles, designed to handle millions of users with 24/7 operation.

## 🚀 Features

### Core Features
- **24/7 News Monitoring**: Continuous fetching and processing of news articles
- **Hourly Domain Generation**: Automated domain extraction and storage every hour
- **Configurable TLDs**: Support for .com, .co, .io, .ai, .net, and custom TLDs
- **Domain Availability Checking**: Real-time domain availability status
- **Price Tracking**: Historical price tracking for domains

### User Management
- **User Authentication**: JWT-based secure authentication
- **Role-Based Access Control**: User and Admin roles
- **Email Verification**: User email verification system
- **Session Management**: Redis-backed session management

### Advanced Features
- **GraphQL API**: Flexible API for complex queries
- **REST API**: Traditional REST endpoints
- **WebSocket Real-time Updates**: Live domain availability notifications
- **Email Notifications**: Alert system for domain changes
- **Analytics Integration**: Comprehensive event tracking
- **A/B Testing Framework**: Built-in experimentation platform

### Admin Dashboard
- **User Management**: View and manage users
- **System Monitoring**: Real-time system health metrics
- **Configuration Management**: Update TLDs and settings
- **Analytics Dashboard**: View usage statistics

### Scalability & Performance
- **PostgreSQL Database**: Enterprise-grade data storage
- **Redis Caching**: High-performance caching layer
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: Protection against abuse
- **Load Balancing Ready**: Designed for horizontal scaling

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: Sequelize
- **API**: REST + GraphQL (Apollo Server)
- **Real-time**: WebSocket (ws)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker
- **Process Manager**: PM2 (production)
- **CI/CD**: GitHub Actions ready

## 📦 Installation

### Prerequisites
- Node.js 20 or higher
- PostgreSQL 16
- Redis 7
- npm or yarn

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Dragonwinner/updated-news-fetch-01.git
cd updated-news-fetch-01
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL and Redis**
```bash
# Using Docker Compose
docker-compose up -d postgres redis
```

5. **Run database migrations**
```bash
# The server will auto-sync tables in development mode
```

6. **Start the application**
```bash
# Start both frontend and backend
npm run dev:all

# Or start them separately:
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- GraphQL: http://localhost:3001/graphql
- WebSocket: ws://localhost:3001/ws

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start all services**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f app
```

3. **Stop services**
```bash
docker-compose down
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key configurations:
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Server port (default: 3001)
- `DB_*`: PostgreSQL connection settings
- `REDIS_*`: Redis connection settings
- `JWT_SECRET`: Secret key for JWT tokens
- `CONFIGURABLE_TLDS`: Comma-separated list of TLDs
- `CRON_ENABLED`: Enable/disable hourly cron job

## 📡 API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Domains
- `GET /api/domains` - List domains (with filters)
- `GET /api/domains/:id` - Get domain by ID
- `GET /api/domains/tlds` - Get available TLDs
- `PUT /api/domains/:id/availability` - Update availability (admin)

#### Health Check
- `GET /api/health` - Server health status

### GraphQL API

Access GraphQL Playground at http://localhost:3001/graphql

Example queries:
```graphql
# Get domains
query {
  domains(available: true, limit: 10) {
    domains {
      id
      name
      tld
      price
      score
    }
    total
  }
}

# Get current user
query {
  me {
    id
    email
    firstName
    lastName
  }
}
```

### WebSocket Events

Connect to `ws://localhost:3001/ws?token=YOUR_JWT_TOKEN`

Events:
- `new_domain` - New domain generated
- `domain_updated` - Domain availability/price changed
- `notification` - User-specific notifications

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js security headers
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention via ORM
- XSS protection
- CORS configuration

## 📊 Monitoring & Analytics

The system tracks:
- User activity and engagement
- Domain view counts
- API endpoint usage
- System performance metrics
- Error rates and types

Access analytics via:
- GraphQL: `analyticsSummary` query
- Admin dashboard (coming soon)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run tests (when implemented)
npm test
```

## 🚦 Production Deployment

### Build for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

### Start Production Server

```bash
# Using PM2
pm2 start dist/server/index.js --name news-domain-api

# Or using Node directly
NODE_ENV=production node dist/server/index.js
```

### Scaling Considerations

For handling millions of users:
1. **Database**: Use read replicas for PostgreSQL
2. **Caching**: Implement Redis cluster
3. **Load Balancing**: Use nginx or AWS ALB
4. **CDN**: Serve static assets via CDN
5. **Monitoring**: Implement APM (New Relic, DataDog)
6. **Logging**: Centralized logging (ELK stack)

## 📝 Development Roadmap

- [ ] Admin dashboard UI
- [ ] Domain availability checker integration
- [ ] Payment integration
- [ ] Advanced search and filters
- [ ] Domain watchlist
- [ ] Mobile app
- [ ] API rate limiting tiers
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments

- News sources: BBC, Wired, TechCrunch
- Open source libraries and their contributors
