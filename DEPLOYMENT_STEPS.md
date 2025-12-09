# Deployment Steps for Backend Integration Updates

## Overview
This document outlines the steps to deploy the new signup, password reset, and delete functionality fixes to your AWS environment.

## Pre-Deployment Checklist

- [ ] Review all changes in the pull request
- [ ] Ensure you have access to:
  - RDS database
  - EC2 backend instance
  - S3/CloudFront frontend distribution
- [ ] Take database backup before applying migration
- [ ] Note current application version for rollback if needed

## Deployment Steps

### 1. Database Migration

First, apply the database migration to add password reset fields:

```bash
# Connect to your EC2 backend instance
ssh -i your-key.pem ec2-user@your-backend-instance

# Navigate to the backend directory
cd /opt/app/backend

# Pull the latest changes
git pull origin main

# Run the migration
psql -h $RDS_HOST -U $RDS_USER -d inventory_db -f src/seeds/add_password_reset_fields.sql
```

**Expected Output:**
```
ALTER TABLE
CREATE INDEX
COMMENT
COMMENT
```

**Verification:**
```bash
psql -h $RDS_HOST -U $RDS_USER -d inventory_db -c "\d users"
```

You should see `reset_token` and `reset_token_expires` columns in the users table.

### 2. Backend Deployment

Deploy the updated backend code:

```bash
# Still on the backend EC2 instance
cd /opt/app/backend

# Install any new dependencies (if needed)
npm install

# Check for syntax errors
npm run lint  # if you have a lint script

# Restart the backend service
pm2 restart inventory-api

# Check logs for any errors
pm2 logs inventory-api --lines 50
```

**Environment Variables to Verify:**
Ensure these are set in your `.env` file:
```bash
NODE_ENV=production
FRONTEND_URL=https://your-cloudfront-domain.com
JWT_SECRET=your-secret-key
BCRYPT_SALT_ROUNDS=10
```

### 3. Frontend Deployment

Deploy the updated frontend:

```bash
# On your local machine or build server
cd frontend

# Install dependencies
npm install

# Build with production API endpoint
VITE_API_BASE=https://your-backend-alb-dns npm run build

# Upload to S3 (if using S3)
aws s3 sync dist/ s3://your-frontend-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 4. Testing

After deployment, test the new features:

#### Test Signup
1. Navigate to your application URL
2. Click "Sign Up"
3. Fill in the form with valid data
4. Submit and verify success message
5. Try logging in with the new account

#### Test Forgot Password
1. Go to login page
2. Click "Forgot Password?"
3. Enter a valid email address
4. Check the backend logs for the reset link:
   ```bash
   pm2 logs inventory-api | grep "reset"
   ```
5. Copy the reset link and open it in a browser
6. Enter a new password and submit
7. Verify you can login with the new password

#### Test Delete Functionality
1. Login as an admin user
2. Go to Items page
3. Click delete on an item
4. Verify the item status changes to "Inactive"
5. Refresh the page and verify the change persisted
6. Repeat for Categories, Users, Groups, Roles, Departments, and Companies

### 5. Monitoring

After deployment, monitor for issues:

```bash
# Check backend logs
pm2 logs inventory-api --lines 100

# Check for errors
pm2 logs inventory-api --err

# Monitor database connections
psql -h $RDS_HOST -U $RDS_USER -d inventory_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'inventory_db';"

# Check CloudWatch metrics (if configured)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=your-alb-name \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## Rollback Procedure

If issues occur, follow these steps to rollback:

### 1. Revert Backend Code
```bash
# On backend EC2 instance
cd /opt/app/backend
git log --oneline -5  # Find the previous commit
git checkout <previous-commit-sha>
pm2 restart inventory-api
```

### 2. Revert Frontend
```bash
# On local machine
cd frontend
git checkout <previous-commit-sha>
VITE_API_BASE=https://your-backend-alb-dns npm run build
aws s3 sync dist/ s3://your-frontend-bucket/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 3. Revert Database (if needed)
```bash
# Only if the migration causes issues
psql -h $RDS_HOST -U $RDS_USER -d inventory_db
```
```sql
DROP INDEX IF EXISTS idx_users_reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expires;
```

## Post-Deployment

### Production Configuration

For production use, you should:

1. **Add Email Service**
   - Integrate AWS SES or another email service
   - Update `backend/src/services/authService.js` to send emails
   - Remove `resetToken` from API response

2. **Add Rate Limiting**
   - Install express-rate-limit: `npm install express-rate-limit`
   - Add rate limiting to auth routes
   - Especially important for `/api/auth/forgot-password`

3. **Configure Environment Variables**
   ```bash
   NODE_ENV=production
   EMAIL_SERVICE=ses
   EMAIL_FROM=noreply@yourdomain.com
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX_REQUESTS=5
   ```

### Security Recommendations

1. Enable AWS WAF on your ALB
2. Set up CloudWatch alarms for:
   - High number of failed login attempts
   - Unusual password reset request patterns
   - High error rates
3. Review IAM permissions for least privilege
4. Enable RDS encryption if not already enabled
5. Set up database backup retention

## Support

For issues during deployment:
1. Check logs: `pm2 logs inventory-api`
2. Review CloudWatch logs
3. Check RDS status in AWS console
4. Verify security group rules allow necessary traffic

## Documentation References

- [PASSWORD_RESET_INSTRUCTIONS.md](./PASSWORD_RESET_INSTRUCTIONS.md) - Password reset user guide
- [INTEGRATION_FIXES.md](./INTEGRATION_FIXES.md) - Previous integration work
- [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md) - Security considerations
