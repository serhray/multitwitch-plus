# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Multitwitch+, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email security concerns to: [your-email@domain.com]
3. Include detailed information about the vulnerability
4. Allow reasonable time for fixes before public disclosure

## Security Measures Implemented

### Authentication & Authorization
- JWT tokens with configurable expiration
- Secure OAuth2 flow with Twitch
- Environment variable validation
- No hardcoded secrets in production

### Input Validation
- Express-validator for all API endpoints
- Request size limits (10MB)
- Parameter sanitization and escaping
- Channel name validation with regex patterns

### Network Security
- CORS properly configured with origin whitelist
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CSP headers for XSS protection

### Data Protection
- Sensitive data not logged in production
- Error messages sanitized for production
- No client secrets exposed to frontend
- Secure cookie settings (when implemented)

### Infrastructure
- Structured logging with Winston
- Graceful shutdown handling
- Health check endpoints
- Environment-based configuration

## Security Checklist for Deployment

- [ ] Set strong JWT_SECRET in production
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Review and update rate limits
- [ ] Configure proper logging levels
- [ ] Set up monitoring and alerts
- [ ] Regular dependency updates
- [ ] Security headers verification

## Dependencies

This project uses security-focused dependencies:
- `helmet` - Security headers
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- `winston` - Secure logging

Regular dependency audits are recommended:
```bash
npm audit
npm audit fix
```
