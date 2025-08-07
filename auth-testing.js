// Authentication Flow Testing Script
console.log('Authentication Test Script Loaded');

// Helper function to make API requests with CSRF token
async function apiRequest(url, method, body = null) {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('CSRF-TOKEN='))
    ?.split('=')[1];
    
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include'
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return {
    status: response.status,
    data: await response.json().catch(() => null)
  };
}

// Test functions for each authentication feature
async function testSignup() {
  console.log('Testing signup...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    password_confirmation: 'password123',
    account_attributes: {
      name: 'Test Account'
    }
  };
  
  const result = await apiRequest('/users', 'POST', { user: testUser });
  console.log('Signup result:', result);
  return testUser;
}

async function testLogin(email, password) {
  console.log('Testing login...');
  const result = await apiRequest('/api/session', 'POST', {
    user: { email, password }
  });
  console.log('Login result:', result);
  return result;
}

async function testSessionState() {
  console.log('Testing session state...');
  const result = await apiRequest('/api/session', 'GET');
  console.log('Session state:', result);
  return result;
}

async function testLogout() {
  console.log('Testing logout...');
  const result = await apiRequest('/api/session', 'DELETE');
  console.log('Logout result:', result);
  return result;
}

// Main test function to run all tests in sequence
async function runAllTests() {
  try {
    console.log('Starting authentication tests...');
    
    // First test signup
    const user = await testSignup();
    
    // Then test login
    await testLogin(user.email, user.password);
    
    // Check session state
    await testSessionState();
    
    // Test logout
    await testLogout();
    
    // Verify session is gone
    await testSessionState();
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// To run all tests, execute in browser console:
// runAllTests()

console.log('Authentication test script ready. Run runAllTests() to start testing.');
