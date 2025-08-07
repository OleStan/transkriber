# Authentication Testing Guide

## Testing the Authentication Flow

### 1. Backend Setup Verification
- Ensure Devise gem is properly configured
- Check API controllers for sessions and registrations
- Verify CSRF protection is in place

### 2. Frontend Testing Steps

#### User Registration
1. Navigate to `/signup`
2. Fill in the registration form:
   - Email
   - Password
   - Password confirmation
   - Account name
3. Submit the form
4. Verify successful account creation and automatic login

#### User Login
1. Navigate to `/login`
2. Fill in the login form:
   - Email
   - Password
3. Submit the form
4. Verify successful login and redirect to home page
5. Check that authenticated UI elements appear (user info in header/sidebar)

#### Accessing Protected Routes
1. Try accessing a protected route (e.g., `/transcriptions`) when not logged in
2. Verify redirect to login page
3. Log in
4. Verify successful redirect back to the protected route

#### User Logout
1. Click on the logout button in the header/sidebar
2. Verify successful logout
3. Verify redirect to login page
4. Try accessing a protected route and confirm redirect to login page

### 3. API Testing
You can use browser developer tools to check:
- Network requests to the API endpoints
- CSRF token handling
- Authentication cookies and headers
- Status codes and response data

### 4. Common Issues
- CSRF token not being sent with requests
- Session cookies not being properly set
- Redirect loops in protected routes
- Form validation errors not displayed to users
