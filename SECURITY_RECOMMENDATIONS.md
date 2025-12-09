# Security Recommendations

## Current Security Status

### Implemented Security Measures ✓
1. **Authentication**: All protected routes require valid JWT token
2. **Authorization**: Role-based access control (RBAC) enforced via middleware
3. **Password Security**: Passwords hashed with bcrypt (salt rounds configurable)
4. **SQL Injection Protection**: Parameterized queries used throughout
5. **CORS**: Configured to restrict frontend origin
6. **TLS/HTTPS**: Terminated at ALB with ACM certificates
7. **Password Validation**: Strong password requirements enforced
8. **Current Password Verification**: Required for password changes

### Recommended Enhancements (Future Work)

#### 1. Rate Limiting (Priority: High)
**Issue**: Routes lack rate limiting which could allow brute force attacks or API abuse.

**Recommendation**: Add rate limiting middleware using `express-rate-limit`

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

**Affected Routes**:
- `PUT /api/users/:id` (userRoutes.js:11)
- `PUT /api/categories/:id` (categoryRoutes.js:14)
- `GET /api/profile` (profileRoutes.js:7)
- `PUT /api/profile` (profileRoutes.js:10)

#### 2. Input Validation (Priority: Medium)
**Recommendation**: Add input validation middleware using `express-validator` or `joi`

Example:
```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware for user updates
const validateUserUpdate = [
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().trim().isLength({ min: 2, max: 128 }),
  body('phone').optional().matches(/^[0-9\+\-\s\(\)]+$/),
  body('status').optional().isIn(['Active', 'Inactive']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.put('/:id', auth, requireRole('user.update'), validateUserUpdate, userController.updateUser);
```

#### 3. Security Headers (Priority: Medium)
**Recommendation**: Add security headers using `helmet`

```javascript
const helmet = require('helmet');
app.use(helmet());
```

This adds:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

#### 4. Request Size Limiting (Priority: Low)
**Current**: Using express.json() without size limits

**Recommendation**: Add request size limits
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

#### 5. Session Management (Priority: Low)
**Recommendation**: Add JWT token refresh mechanism and blacklist for logout

```javascript
// Add refresh token endpoint
router.post('/api/auth/refresh', refreshTokenMiddleware, authController.refreshToken);

// Add logout endpoint that blacklists token
router.post('/api/auth/logout', auth, authController.logout);
```

#### 6. Audit Logging (Priority: Medium)
**Recommendation**: Log security-relevant events

```javascript
const auditLog = (action, userId, details) => {
  console.log({
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: req.ip
  });
};

// Use in sensitive operations
auditLog('USER_UPDATE', req.user.id, { targetUserId: req.params.id });
auditLog('PASSWORD_CHANGE', req.user.id, { success: true });
auditLog('LOGIN_ATTEMPT', user.id, { success: true });
```

#### 7. Database Security (Priority: Low)
**Current Status**: Using parameterized queries (good)

**Additional Recommendations**:
- Enable RDS encryption at rest
- Enable RDS automated backups
- Use AWS Secrets Manager for database credentials
- Implement connection pooling with limits
- Use read replicas for read-heavy operations

#### 8. Environment Variables (Priority: Medium)
**Recommendation**: Use AWS Secrets Manager or Parameter Store

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function loadSecrets() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'inventory-app-secrets'
  }).promise();
  
  const secrets = JSON.parse(secret.SecretString);
  process.env.JWT_SECRET = secrets.JWT_SECRET;
  process.env.RDS_PASSWORD = secrets.RDS_PASSWORD;
}
```

## Security Testing Checklist

- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass for different roles
- [ ] Test SQL injection on all input fields
- [ ] Test XSS in text inputs (name, description, etc.)
- [ ] Test CSRF protection
- [ ] Test rate limiting effectiveness
- [ ] Test password strength requirements
- [ ] Test session timeout/expiry
- [ ] Test file upload restrictions (if applicable)
- [ ] Review CloudWatch logs for anomalies

## Incident Response Plan

### If Security Breach Detected:

1. **Immediate Actions**:
   - Rotate JWT_SECRET immediately
   - Invalidate all active sessions
   - Review CloudWatch logs for unauthorized access
   - Check RDS query logs for suspicious queries

2. **Investigation**:
   - Identify attack vector
   - Determine scope of data accessed
   - Review audit logs

3. **Remediation**:
   - Patch vulnerability
   - Deploy fixes
   - Force password reset for affected users
   - Notify stakeholders if required

4. **Post-Incident**:
   - Document lessons learned
   - Update security measures
   - Schedule security review

## Compliance Considerations

Depending on your use case, consider:
- GDPR compliance (if handling EU user data)
- HIPAA compliance (if handling health data)
- PCI DSS (if handling payment data)
- SOC 2 Type II audit requirements

## Regular Security Maintenance

1. **Weekly**:
   - Review CloudWatch logs and alarms
   - Check for failed login attempts
   - Monitor API error rates

2. **Monthly**:
   - Update npm dependencies (`npm audit fix`)
   - Review AWS security group rules
   - Check for deprecated APIs

3. **Quarterly**:
   - Penetration testing
   - Security code review
   - Update security documentation
   - Review and rotate secrets

4. **Annually**:
   - Third-party security audit
   - Disaster recovery drill
   - Update incident response plan
   - Security awareness training

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
