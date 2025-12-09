# Frontend-Backend Integration Fixes

## Overview
This document describes the fixes applied to resolve frontend-backend integration issues where edit/save buttons were not working properly.

## Issues Fixed

### 1. Missing Backend Endpoints
**Problem**: Frontend components were trying to update items, categories, and users, but backend API endpoints for updates (PUT/PATCH) didn't exist.

**Solution**: Added the following backend endpoints:
- `PUT /api/items/:id` - Update an item
- `PUT /api/categories/:id` - Update a category  
- `PUT /api/users/:id` - Update a user
- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update current user's profile

### 2. Frontend Not Calling Backend APIs
**Problem**: Frontend components (AddItemModal, AddCategoryModal) were only updating local state, not persisting changes to the database.

**Solution**: Updated frontend components to call backend APIs:
- `AddItemModal.jsx` - Now calls `authPost` for creating and `authPut` for updating items
- `AddCategoryModal.jsx` - Now calls `authPost` for creating and `authPut` for updating categories
- `AddUsersModal.jsx` - Fixed to support both create (POST) and update (PUT) operations
- `Profile.jsx` - Now fetches profile from backend on load and saves changes via API

### 3. Missing API Client Functions
**Problem**: `apiClient.js` was missing DELETE method and proper error handling.

**Solution**: 
- Added `apiDelete` and `authDelete` functions
- Updated `withUnauthorizedHandler` to include delete method
- All HTTP methods now properly handle 401 errors

### 4. User Edit Functionality
**Problem**: User edit modal opened but didn't actually update users in the database, only local state.

**Solution**:
- Updated `AddUsersModal` to handle both create and edit modes
- Made password optional when editing (only updates if new password provided)
- Added proper validation for edit vs create scenarios

### 5. Profile Not Connected to Backend
**Problem**: Profile page only saved to localStorage, not to database.

**Solution**:
- Added profile service, controller, and routes in backend
- Profile component now fetches user data from `/api/profile`
- Profile updates are saved to database via `PUT /api/profile`
- Supports password changes with current password verification

## Database Schema Changes

Added two new columns to the `users` table:
- `phone` VARCHAR(32) - User's phone number
- `location` VARCHAR(128) - User's location

Migration script: `backend/src/seeds/add_user_profile_fields.sql`

## Files Modified

### Backend
- `backend/src/services/itemService.js` - Added `updateItem` function
- `backend/src/services/categoryService.js` - Added `updateCategory` function
- `backend/src/services/userService.js` - Added `updateUser` function
- `backend/src/services/profileService.js` - NEW: Profile service
- `backend/src/controllers/itemController.js` - Added `updateItem` controller
- `backend/src/controllers/categoryController.js` - Added `updateCategory` controller
- `backend/src/controllers/userController.js` - Added `updateUser` controller
- `backend/src/controllers/profileController.js` - NEW: Profile controller
- `backend/src/routes/itemRoutes.js` - Added PUT route
- `backend/src/routes/categoryRoutes.js` - Added PUT route
- `backend/src/routes/userRoutes.js` - Added PUT route
- `backend/src/routes/profileRoutes.js` - NEW: Profile routes
- `backend/src/index.js` - Registered profile routes

### Frontend
- `frontend/src/apiClient.js` - Added DELETE methods
- `frontend/src/components/inventory/AddItemModal.jsx` - Integrated with backend API
- `frontend/src/components/inventory/AddCategoryModal.jsx` - Integrated with backend API
- `frontend/src/components/inventory/ItemManagement.jsx` - Refetch categories after save
- `frontend/src/components/users/AddUsersModal.jsx` - Added edit support
- `frontend/src/components/users/UsersTab.jsx` - Fixed modal state management
- `frontend/src/components/profile/Profile.jsx` - Integrated with backend API

## Deployment Steps

### 1. Deploy Backend Changes

```bash
cd backend

# Install dependencies (if any new ones were added)
npm install

# Run database migration to add phone and location columns
psql -h $RDS_HOST -U $RDS_USER -d inventory_db -f src/seeds/add_user_profile_fields.sql

# Restart the backend service
pm2 restart inventory-api
```

### 2. Deploy Frontend Changes

```bash
cd frontend

# Rebuild with production API base URL
VITE_API_BASE=https://<your-backend-alb-dns> npm run build

# Copy build files to Nginx directory
sudo cp -r dist/* /opt/app/frontend/dist/

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Clear Browser Cache
Users should clear their browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to get the latest JavaScript files.

## Testing

### Test Item Management
1. Go to Items page
2. Click "Add Item" 
3. Fill in all fields and click "Add Item"
4. Verify item appears in list
5. Click edit icon on an item
6. Modify fields and click "Update Item"
7. Verify changes are saved and persist after page refresh

### Test Category Management
1. Go to Items page, switch to "Category" tab
2. Click "Add Category"
3. Enter category name and click "Save"
4. Verify category appears in list
5. Click edit icon on a category
6. Modify and save
7. Verify changes persist after page refresh

### Test User Management
1. Go to Users page
2. Click "Add User"
3. Fill in all required fields and create user
4. Verify user appears in list
5. Click edit icon on a user
6. Modify fields (password is optional when editing)
7. Save and verify changes persist

### Test Profile
1. Click profile icon/menu
2. Modify first name, last name, phone, location
3. Click "Save Changes"
4. Verify success message
5. Refresh page and verify changes persisted

### Test Password Change
1. Go to Profile page
2. Fill in current password, new password, and confirm password
3. Click "Save Changes"
4. Logout and login with new password
5. Verify new password works

## Troubleshooting

### Items/Categories Not Saving
- Check browser console for errors
- Verify `VITE_API_BASE` environment variable is set correctly during build
- Check backend logs: `pm2 logs inventory-api`
- Verify user has proper permissions (check JWT token and role)

### 401 Unauthorized Errors
- User session may have expired
- Logout and login again
- Check that JWT_SECRET is consistent across backend instances

### Database Connection Issues
- Verify RDS security group allows connections from backend EC2 security group
- Check RDS_HOST, RDS_PORT, RDS_USER, RDS_PASSWORD in backend .env
- Test connection: `psql -h $RDS_HOST -U $RDS_USER -d inventory_db`

### CORS Errors
- Verify FRONTEND_ORIGIN in backend .env matches the frontend URL
- Should be: `FRONTEND_ORIGIN=https://d2n61sfstcgqqd.cloudfront.net`
- Restart backend after changing

## Rollback Procedure

If issues occur:

1. Revert backend code:
```bash
cd /opt/app
git checkout <previous-commit-sha>
cd backend
pm2 restart inventory-api
```

2. Revert frontend code:
```bash
cd /opt/app
git checkout <previous-commit-sha>
cd frontend
VITE_API_BASE=https://<backend-url> npm run build
sudo cp -r dist/* /opt/app/frontend/dist/
sudo systemctl restart nginx
```

3. Database migration can be reversed by dropping the columns (if needed):
```sql
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS location;
```

## Security Considerations

1. Password changes require current password verification
2. All update endpoints require authentication (JWT token)
3. Role-based access control (RBAC) enforced on user/category operations
4. SQL injection protected by parameterized queries
5. Passwords hashed with bcrypt before storage

## Performance Notes

- Database indexes exist on frequently queried columns (id, sku, email, username)
- Category list is cached in frontend and only refetched after modifications
- User list loads once and updates locally after changes
- All API calls have error handling and user feedback
