# Password Reset Instructions

## Overview
The application now supports password reset functionality with secure token-based authentication. Users can request a password reset link that allows them to create a new password.

## Reset Password Link Format

### Production URL Format
```
https://<your-cloudfront-domain>/?page=reset&token=<reset-token>
```

### Local Development URL Format
```
http://localhost:5173/?page=reset&token=<reset-token>
```

### Example
If your CloudFront domain is `d2n61sfstcgqqd.cloudfront.net` and the reset token is `abc123def456`, the reset password link would be:
```
https://d2n61sfstcgqqd.cloudfront.net/?page=reset&token=abc123def456
```

## How It Works

### 1. User Requests Password Reset
1. User navigates to the "Forgot Password" page
2. User enters their email address
3. System generates a secure reset token (valid for 1 hour)
4. Backend returns the reset link (in production, this would be sent via email)

### 2. User Clicks Reset Link
1. User clicks the reset link from their email (or console log in development)
2. Frontend extracts the token from the URL query parameter
3. User enters their new password
4. System validates the token and updates the password

### 3. Token Security
- Reset tokens are hashed using SHA-256 before storage
- Tokens expire after 1 hour
- Tokens are single-use (cleared after successful password reset)
- Invalid or expired tokens are rejected

## Testing Password Reset

### Step 1: Request Password Reset
1. Go to login page
2. Click "Forgot Password?"
3. Enter a valid email address (must exist in the database)
4. Submit the form

### Step 2: Get Reset Link
**Development Mode:**
- Check the browser console for the reset link
- The link will be logged as: `Password reset link: <url>`

**Production Mode:**
- The link should be sent via email (email service integration required)
- For testing without email, check the backend API response

### Step 3: Reset Password
1. Copy the reset link from console/email
2. Paste it into your browser
3. Enter your new password (must meet requirements):
   - Minimum 8 characters
   - Include uppercase and lowercase letters
   - Include at least one digit
   - Include at least one special character
4. Submit the form
5. You should see a success message and be redirected to login

### Step 4: Test New Password
1. Go to login page
2. Enter your email and new password
3. Verify successful login

## Backend API Endpoints

### POST /api/auth/forgot-password
Request a password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent.",
  "resetLink": "https://your-domain.com/?page=reset&token=abc123..."
}
```

**Note:** The `resetLink` field is only returned in development. In production, this should be sent via email service.

### POST /api/auth/reset-password
Reset password using the token.

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

## Database Migration

Before using password reset functionality, run the database migration:

```bash
cd backend
psql -h $RDS_HOST -U $RDS_USER -d inventory_db -f src/seeds/add_password_reset_fields.sql
```

This adds:
- `reset_token` column (VARCHAR 255)
- `reset_token_expires` column (TIMESTAMP)
- Index on `reset_token` for faster lookups

## Production Deployment Notes

### Email Service Integration
For production use, integrate an email service (AWS SES, SendGrid, etc.) to send password reset emails:

1. Install email service package (e.g., `nodemailer`, `@aws-sdk/client-ses`)
2. Update `backend/src/services/authService.js` `forgotPassword` function
3. Send email with reset link instead of returning it in response
4. Remove `resetLink` from API response

### Environment Variables
Add to `.env`:
```
FRONTEND_URL=https://your-cloudfront-domain.com
EMAIL_SERVICE_API_KEY=your-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### Security Considerations
1. **HTTPS Only**: Ensure all reset links use HTTPS in production
2. **Token Expiry**: Tokens expire after 1 hour (configurable in code)
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Email Verification**: Verify email ownership before allowing password reset
5. **Logging**: Log password reset attempts for security auditing

## Troubleshooting

### "Invalid or expired reset token"
- Token may have expired (>1 hour old)
- Token may have already been used
- Token may be malformed
- Request a new password reset link

### Reset link not working
- Verify the token parameter is in the URL
- Check browser console for errors
- Verify backend is running and accessible
- Check database for reset_token columns

### Email not found
- User may have entered wrong email
- User account may not exist
- Check database users table

## Support
For issues or questions, contact the development team or check the main README.md for general application support.
