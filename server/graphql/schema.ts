export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    isActive: Boolean!
    emailVerified: Boolean!
    createdAt: String!
  }

  type Domain {
    id: ID!
    name: String!
    tld: String!
    available: Boolean!
    price: Float
    currency: String!
    keywords: [String!]!
    score: Int!
    generatedAt: String!
    checkedAt: String
    popularity: Int!
    priceHistory: [PriceHistory!]
  }

  type PriceHistory {
    price: Float!
    date: String!
  }

  type NewsArticle {
    id: ID!
    title: String!
    description: String!
    content: String!
    url: String!
    source: String!
    publishedAt: String!
    extractedKeywords: [String!]!
  }

  type DomainConnection {
    domains: [Domain!]!
    total: Int!
    limit: Int!
    offset: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Alert {
    id: ID!
    userId: ID!
    domainId: ID
    alertType: String!
    conditions: String!
    isActive: Boolean!
    notificationEmail: Boolean!
    notificationPush: Boolean!
  }

  type AnalyticsSummary {
    totalEvents: Int!
    uniqueUsers: Int!
    uniqueSessions: Int!
    eventTypes: String!
  }

  type ABTestResult {
    id: ID!
    name: String!
    description: String!
    isActive: Boolean!
    variants: String!
    metrics: String!
  }

  type DashboardStats {
    users: UserStats!
    domains: DomainStats!
    articles: ArticleStats!
    analytics: AnalyticsStats!
    system: SystemStats!
  }

  type UserStats {
    total: Int!
    active: Int!
    admins: Int!
    newToday: Int!
    newThisWeek: Int!
    newThisMonth: Int!
  }

  type DomainStats {
    total: Int!
    available: Int!
    unavailable: Int!
    generatedToday: Int!
    generatedThisWeek: Int!
    generatedThisMonth: Int!
    avgScore: Int!
  }

  type ArticleStats {
    total: Int!
    todayCount: Int!
    thisWeekCount: Int!
    thisMonthCount: Int!
    sources: [SourceCount!]!
  }

  type SourceCount {
    source: String!
    count: Int!
  }

  type AnalyticsStats {
    totalEvents: Int!
    uniqueUsers: Int!
    uniqueSessions: Int!
    topEvents: [EventCount!]!
  }

  type EventCount {
    eventType: String!
    count: Int!
  }

  type SystemStats {
    databaseSize: String!
    redisConnected: Boolean!
    uptime: Float!
  }

  type UserGrowthData {
    date: String!
    total: Int!
    new: Int!
  }

  type DomainGenerationData {
    date: String!
    count: Int!
    available: Int!
  }

  type ActivityMetrics {
    hour: String!
    events: Int!
    users: Int!
  }

  type UserConnection {
    users: [User!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type Query {
    me: User
    domains(tld: String, available: Boolean, minScore: Int, limit: Int, offset: Int): DomainConnection!
    domain(id: ID!): Domain
    newsArticles(limit: Int): [NewsArticle!]!
    newsArticle(id: ID!): NewsArticle
    myAlerts: [Alert!]!
    analyticsSummary(days: Int): AnalyticsSummary!
    activeABTests: [ABTestResult!]!
    
    # Admin queries
    adminDashboardStats: DashboardStats!
    adminUserGrowth(days: Int): [UserGrowthData!]!
    adminDomainGeneration(days: Int): [DomainGenerationData!]!
    adminActivityMetrics(hours: Int): [ActivityMetrics!]!
    adminUsers(page: Int, limit: Int): UserConnection!
  }

  type Mutation {
    register(email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createAlert(domainId: ID, alertType: String!, conditions: String!, notificationEmail: Boolean, notificationPush: Boolean): Alert!
    deleteAlert(id: ID!): Boolean!
    trackEvent(eventType: String!, eventData: String!): Boolean!
    
    # Admin mutations
    adminUpdateUserStatus(userId: ID!, isActive: Boolean!): User!
    adminUpdateUserRole(userId: ID!, role: String!): User!
  }

  type Subscription {
    domainUpdated: Domain!
    newDomainGenerated: Domain!
  }
`;
