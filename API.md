# API Reference

Complete API documentation for the News Domain Generator.

## Base URLs

- **REST API**: `http://localhost:3001/api`
- **GraphQL**: `http://localhost:3001/graphql`
- **WebSocket**: `ws://localhost:3001/ws`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by logging in or registering.

---

## REST API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "emailVerified": false
  }
}
```

### Domains

#### List Domains
```http
GET /api/domains?tld=.com&available=true&minScore=50&limit=20&offset=0
```

**Query Parameters:**
- `tld` (optional): Filter by TLD (e.g., `.com`, `.io`)
- `available` (optional): Filter by availability (true/false)
- `minScore` (optional): Minimum score (0-100)
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "domains": [
    {
      "id": "uuid",
      "name": "techstartup",
      "tld": ".com",
      "available": true,
      "price": 10.99,
      "currency": "USD",
      "keywords": ["tech", "startup"],
      "score": 75,
      "generatedAt": "2024-01-01T00:00:00Z",
      "popularity": 42
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

#### Get Domain by ID
```http
GET /api/domains/:id
```

**Response:**
```json
{
  "domain": {
    "id": "uuid",
    "name": "techstartup",
    "tld": ".com",
    "available": true,
    "price": 10.99,
    "keywords": ["tech", "startup"],
    "score": 75,
    "priceHistory": [
      { "price": 12.99, "date": "2024-01-01T00:00:00Z" },
      { "price": 10.99, "date": "2024-01-15T00:00:00Z" }
    ]
  }
}
```

#### Get Available TLDs
```http
GET /api/domains/tlds
```

**Response:**
```json
{
  "tlds": [".com", ".co", ".io", ".ai", ".net"]
}
```

#### Update Domain Availability (Admin Only)
```http
PUT /api/domains/:id/availability
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "available": true,
  "price": 10.99
}
```

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## GraphQL API

### Queries

#### Get Current User
```graphql
query {
  me {
    id
    email
    firstName
    lastName
    role
    isActive
    emailVerified
    createdAt
  }
}
```

#### Get Domains
```graphql
query GetDomains($tld: String, $available: Boolean, $minScore: Int, $limit: Int, $offset: Int) {
  domains(
    tld: $tld
    available: $available
    minScore: $minScore
    limit: $limit
    offset: $offset
  ) {
    domains {
      id
      name
      tld
      available
      price
      currency
      keywords
      score
      generatedAt
      popularity
      priceHistory {
        price
        date
      }
    }
    total
    limit
    offset
  }
}
```

**Variables:**
```json
{
  "tld": ".com",
  "available": true,
  "minScore": 50,
  "limit": 20,
  "offset": 0
}
```

#### Get Single Domain
```graphql
query GetDomain($id: ID!) {
  domain(id: $id) {
    id
    name
    tld
    available
    price
    keywords
    score
    priceHistory {
      price
      date
    }
  }
}
```

#### Get News Articles
```graphql
query GetNewsArticles($limit: Int) {
  newsArticles(limit: $limit) {
    id
    title
    description
    content
    url
    source
    publishedAt
    extractedKeywords
  }
}
```

#### Get My Alerts
```graphql
query {
  myAlerts {
    id
    domainId
    alertType
    conditions
    isActive
    notificationEmail
    notificationPush
  }
}
```

#### Get Analytics Summary
```graphql
query GetAnalytics($days: Int) {
  analyticsSummary(days: $days) {
    totalEvents
    uniqueUsers
    uniqueSessions
    eventTypes
  }
}
```

#### Get Active A/B Tests
```graphql
query {
  activeABTests {
    id
    name
    description
    isActive
    variants
    metrics
  }
}
```

### Mutations

#### Register User
```graphql
mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  register(
    email: $email
    password: $password
    firstName: $firstName
    lastName: $lastName
  ) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### Login
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### Create Alert
```graphql
mutation CreateAlert(
  $domainId: ID
  $alertType: String!
  $conditions: String!
  $notificationEmail: Boolean
  $notificationPush: Boolean
) {
  createAlert(
    domainId: $domainId
    alertType: $alertType
    conditions: $conditions
    notificationEmail: $notificationEmail
    notificationPush: $notificationPush
  ) {
    id
    alertType
    isActive
  }
}
```

**Variables:**
```json
{
  "domainId": "uuid",
  "alertType": "availability",
  "conditions": "{\"notify\": true}",
  "notificationEmail": true,
  "notificationPush": false
}
```

#### Delete Alert
```graphql
mutation DeleteAlert($id: ID!) {
  deleteAlert(id: $id)
}
```

#### Track Event
```graphql
mutation TrackEvent($eventType: String!, $eventData: String!) {
  trackEvent(eventType: $eventType, eventData: $eventData)
}
```

**Variables:**
```json
{
  "eventType": "domain_view",
  "eventData": "{\"domainId\": \"uuid\"}"
}
```

---

## WebSocket API

### Connection

Connect to WebSocket with JWT token:
```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Message Types

#### Connected
Sent when connection is established:
```json
{
  "type": "connected",
  "message": "Connected to real-time updates"
}
```

#### New Domain Generated
Sent when a new domain is created:
```json
{
  "type": "new_domain",
  "data": {
    "id": "uuid",
    "name": "techstartup",
    "tld": ".com",
    "score": 75
  }
}
```

#### Domain Updated
Sent when domain availability or price changes:
```json
{
  "type": "domain_updated",
  "data": {
    "id": "uuid",
    "available": true,
    "price": 10.99
  }
}
```

#### User Notification
Sent for user-specific notifications:
```json
{
  "type": "notification",
  "data": {
    "title": "Domain Available",
    "message": "techstartup.com is now available!"
  }
}
```

### Sending Messages

#### Ping
```javascript
ws.send(JSON.stringify({
  type: 'ping'
}));

// Response:
{
  "type": "pong"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limits

- **API Endpoints**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **Strict Endpoints**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Examples

### Complete Registration & Domain Fetch Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});
const { token } = await registerResponse.json();

// 2. Get domains
const domainsResponse = await fetch('http://localhost:3001/api/domains?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { domains } = await domainsResponse.json();

// 3. Connect to WebSocket
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'new_domain') {
    console.log('New domain:', message.data);
  }
};
```

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/your-repo/issues
- API Status: http://localhost:3001/api/health
