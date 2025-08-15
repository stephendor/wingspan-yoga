#!/usr/bin/env node

/**
 * Test script to verify rate limiting is working correctly
 * Usage: node scripts/test-rate-limiting.js
 */

const BASE_URL = 'http://localhost:3000';

async function testRateLimit(endpoint, maxRequests = 6) {
  console.log(`\n🧪 Testing rate limiting for ${endpoint}`);
  console.log(`Making ${maxRequests} requests...`);
  
  const results = [];
  
  for (let i = 1; i <= maxRequests; i++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          password: 'password123'
        })
      });
      
      const data = await response.json();
      
      results.push({
        request: i,
        status: response.status,
        rateLimited: response.status === 429,
        message: data.error || data.message || 'Success'
      });
      
      console.log(`Request ${i}: Status ${response.status} - ${data.error || data.message || 'Success'}`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Request ${i} failed:`, error.message);
      results.push({
        request: i,
        status: 'ERROR',
        rateLimited: false,
        message: error.message
      });
    }
  }
  
  // Summary
  const rateLimitedCount = results.filter(r => r.rateLimited).length;
  const successCount = results.filter(r => r.status === 200 || r.status === 201).length;
  
  console.log(`\n📊 Summary for ${endpoint}:`);
  console.log(`  ✅ Successful requests: ${successCount}`);
  console.log(`  🚫 Rate limited requests: ${rateLimitedCount}`);
  console.log(`  🔒 Rate limiting ${rateLimitedCount > 0 ? 'WORKING' : 'NOT DETECTED'}`);
  
  return results;
}

async function main() {
  console.log('🔒 Rate Limiting Test Suite');
  console.log('==========================');
  
  try {
    // Test registration endpoint (should allow 3 per hour, but we'll test with more)
    await testRateLimit('/api/auth/register', 6);
    
    // You can add more endpoints here
    // await testRateLimit('/api/payments/create-intent', 12);
    
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start with: npm run dev');
    return false;
  }
}

// Run tests
checkServer().then(serverRunning => {
  if (serverRunning) {
    main();
  }
});