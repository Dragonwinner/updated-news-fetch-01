# Admin Dashboard Deployment Notes

## Overview
This deployment adds a comprehensive admin dashboard with statistics visualization, user management, and real-time monitoring capabilities to the News Domain Generator platform.

## New Dependencies

### Frontend
- **recharts** (^2.x): Charting library for data visualization
  - No breaking changes
  - Pure peer dependency on React
  - Bundle size: ~150KB minified

### Backend
No new dependencies added. Uses existing infrastructure:
- PostgreSQL for data storage
- Redis for statistics caching
- Sequelize ORM for queries

## Database Changes

### Schema Updates
**No database migrations required.** The admin dashboard uses existing tables:
- `users` - User management
- `domains` - Domain statistics
- `news_articles` - Article statistics
- `analytics_events` - Event tracking

### New Indexes
**No new indexes added.** Existing indexes are sufficient:
- `users.email` (unique)
- `domains.name, domains.tld`
- `domains.available`
- `domains.generated_at`
- `analytics_events.user_id`
- `analytics_events.event_type`
- `analytics_events.created_at`

## Configuration Changes

### Environment Variables
No new environment variables required. Uses existing configuration:
- `JWT_SECRET` - For admin authentication
- `REDIS_HOST`, `REDIS_PORT` - For caching
- `DB_*` - For database connection
- `RATE_LIMIT_*` - For endpoint rate limiting

### Redis Caching
Admin statistics are cached with the following keys:
- `admin:dashboard:stats` (TTL: 5 minutes)
- `admin:user-growth:{days}` (TTL: 5 minutes)
- `admin:domain-generation:{days}` (TTL: 5 minutes)
- `admin:activity-metrics:{hours}` (TTL: 5 minutes)

**Cache Clearing:** Available via `POST /api/admin/cache/clear` endpoint

## API Changes

### New REST Endpoints
All endpoints require authentication with admin role:

```
GET  /api/admin/stats                      - Dashboard statistics
GET  /api/admin/stats/user-growth          - User growth data
GET  /api/admin/stats/domain-generation    - Domain trends
GET  /api/admin/stats/activity             - Activity metrics
GET  /api/admin/users                      - User list
PATCH /api/admin/users/:id/status          - Update user status
PATCH /api/admin/users/:id/role            - Update user role
POST /api/admin/cache/clear                - Clear cache
```

### New GraphQL Queries
```graphql
adminDashboardStats      - Dashboard statistics
adminUserGrowth          - User growth data
adminDomainGeneration    - Domain trends
adminActivityMetrics     - Activity metrics
adminUsers               - User list
```

### New GraphQL Mutations
```graphql
adminUpdateUserStatus    - Update user status
adminUpdateUserRole      - Update user role
```

### Rate Limiting
- GraphQL endpoint: 100 requests per 15 minutes
- Admin REST endpoints: 100 requests per 15 minutes (inherits from `/api` limiter)

## Security

### Authentication & Authorization
- All admin endpoints require JWT with `role: 'admin'`
- Middleware: `authenticate` + `requireAdmin`
- GraphQL queries/mutations check `context.user.role === 'admin'`

### Rate Limiting
- GraphQL endpoint now has dedicated rate limiter
- All admin REST endpoints inherit API rate limiter
- Default: 100 requests per 15 minutes per IP

### Data Protection
- User passwords never exposed in admin responses
- All database queries use parameterized statements (Sequelize)
- Redis errors handled gracefully (continues without cache)

### Security Scan Results
✅ CodeQL: 0 alerts
✅ No SQL injection vulnerabilities
✅ No XSS vulnerabilities
✅ Proper authentication on all endpoints

## Performance Considerations

### Caching Strategy
- Statistics cached in Redis with 5-minute TTL
- Cache keys prefixed with `admin:` for easy management
- Graceful fallback if Redis unavailable
- Manual cache clear available for admins

### Database Query Optimization
- All queries use existing indexes
- Aggregation queries use PostgreSQL-optimized SQL
- Pagination implemented for user lists (50 per page)
- Complex statistics queries cached

### Frontend Performance
- Lazy loading for admin components
- Charts rendered only when visible
- Auto-refresh with configurable intervals
- Responsive design for mobile devices

## Rollback Plan

### To Rollback This Deployment

1. **Revert Git Commit:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Clear Redis Cache (Optional):**
   ```bash
   redis-cli
   KEYS admin:*
   DEL admin:dashboard:stats admin:user-growth:* admin:domain-generation:* admin:activity-metrics:*
   ```

3. **Restart Services:**
   ```bash
   pm2 restart news-domain-api
   ```

### Impact of Rollback
- Admin dashboard UI will be unavailable
- Admin API endpoints will return 404
- No data loss (uses existing tables)
- No impact on existing features
- Users and domains continue to work normally

## Monitoring

### Key Metrics to Monitor

1. **Redis Performance:**
   - Cache hit rate for `admin:*` keys
   - Memory usage increase (minimal, ~1-5MB)

2. **Database Performance:**
   - Query times for admin statistics endpoints
   - Connection pool utilization during admin access

3. **API Response Times:**
   - `/api/admin/stats` - Expected: <500ms (cached)
   - `/api/admin/stats/user-growth` - Expected: <1s
   - `/api/admin/users` - Expected: <200ms

4. **Error Rates:**
   - 401 Unauthorized (non-admin access attempts)
   - 429 Too Many Requests (rate limit hits)
   - 500 Internal Server Error (should be near zero)

### Logging
Admin actions are logged through existing analytics:
- User status changes
- User role changes
- Admin dashboard access
- Cache clear operations

## Testing Recommendations

### Pre-Deployment Testing

1. **Build Verification:**
   ```bash
   npm run lint
   npm run build
   npm run build:server
   ```

2. **Security Scan:**
   ```bash
   npm audit
   # CodeQL already passed
   ```

### Post-Deployment Testing

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Admin Login:**
   - Login with admin account
   - Navigate to admin panel via user menu
   - Verify dashboard loads

3. **Statistics Display:**
   - Check all stat cards display numbers
   - Verify charts render correctly
   - Test date range selector

4. **User Management:**
   - View user list
   - Test pagination
   - Update user status (activate/deactivate)
   - Update user role

5. **Cache Performance:**
   - First load (cache miss): ~1s
   - Subsequent loads (cache hit): <200ms
   - Clear cache and verify refresh

## Known Limitations

1. **Real-time Updates:**
   - Statistics update every 5 minutes via cache
   - Manual refresh available for latest data

2. **Large Datasets:**
   - User growth queries limited to 90 days
   - Activity metrics limited to 24-72 hours
   - User list paginated at 50 per page

3. **Browser Compatibility:**
   - Modern browsers only (ES2020+)
   - No IE11 support

## Support

### Common Issues

**Issue:** Admin panel not showing in user menu
**Solution:** Ensure user has `role: 'admin'` in database

**Issue:** Statistics showing stale data
**Solution:** Use "Clear Cache" button in dashboard

**Issue:** Charts not rendering
**Solution:** Check browser console for errors, verify recharts loaded

**Issue:** 429 Rate Limit errors
**Solution:** Wait 15 minutes or increase `RATE_LIMIT_MAX_REQUESTS` env var

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'admin:*');
```

## Maintenance

### Regular Tasks

1. **Monitor Cache Size:**
   ```bash
   redis-cli
   MEMORY USAGE admin:dashboard:stats
   ```

2. **Check Query Performance:**
   ```sql
   -- PostgreSQL
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   WHERE query LIKE '%admin%'
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Review Admin Actions:**
   ```sql
   SELECT event_type, COUNT(*)
   FROM analytics_events
   WHERE event_type LIKE 'admin_%'
   GROUP BY event_type;
   ```

### Cleanup
No cleanup required. Admin cache expires automatically after 5 minutes.

## Deployment Checklist

- [ ] Review and merge PR
- [ ] Run build: `npm run build && npm run build:server`
- [ ] Run tests: `npm test` (if applicable)
- [ ] Deploy to staging
- [ ] Test admin dashboard in staging
- [ ] Deploy to production
- [ ] Verify health check
- [ ] Test admin login
- [ ] Monitor logs for 15 minutes
- [ ] Announce feature to admins

## Success Criteria

✅ Admin dashboard accessible to admin users
✅ Statistics display correctly
✅ Charts render and are interactive
✅ User management functions work
✅ Cache improves response times
✅ No security vulnerabilities
✅ No increase in error rates
✅ API response times within SLA

---

**Deployment Date:** TBD
**Deployed By:** TBD
**Version:** 1.0.0
**Status:** Ready for Deployment
