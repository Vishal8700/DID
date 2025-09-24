const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    console.log(`\n${colors.blue}🧪 Testing: ${colors.bold}${name}${colors.reset}`);
    console.log(`   ${method.toUpperCase()} ${url}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    log('green', `   ✅ SUCCESS (${response.status})`);
    console.log(`   📄 Response:`, JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.response) {
      log('red', `   ❌ FAILED (${error.response.status})`);
      console.log(`   📄 Error Response:`, JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data, status: error.response.status };
    } else {
      log('red', `   ❌ NETWORK ERROR: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  console.log(`${colors.bold}${colors.blue}🚀 Testing @gitalien/auth_package Integration${colors.reset}\n`);
  
  let jwt_token = null;
  const results = [];
  
  // Test 1: Health Check
  const health = await testEndpoint('Health Check', 'GET', '/health');
  results.push({ name: 'Health Check', ...health });
  
  // Test 2: Root endpoint
  const root = await testEndpoint('Root Endpoint', 'GET', '/');
  results.push({ name: 'Root Endpoint', ...root });
  
  // Test 3: Public route
  const publicRoute = await testEndpoint('Public Route', 'GET', '/api/public');
  results.push({ name: 'Public Route', ...publicRoute });
  
  // Test 4: User stats (public)
  const stats = await testEndpoint('User Statistics', 'GET', '/api/auth/stats/users');
  results.push({ name: 'User Statistics', ...stats });
  
  // Test 5: Challenge generation
  const challenge = await testEndpoint('Challenge Generation', 'GET', `/api/auth/challenge/${TEST_ADDRESS}`);
  results.push({ name: 'Challenge Generation', ...challenge });
  
  // Test 6: ENS Resolution (without Infura key)
  const ens = await testEndpoint('ENS Resolution', 'POST', '/api/auth/resolve-ens', {
    address: TEST_ADDRESS
  });
  results.push({ name: 'ENS Resolution', ...ens });
  
  // Test 7: Auth with invalid signature (should fail)
  const invalidAuth = await testEndpoint('Invalid Authentication', 'POST', '/api/auth/auth', {
    address: TEST_ADDRESS,
    signature: 'invalid-signature'
  });
  results.push({ name: 'Invalid Authentication', ...invalidAuth });
  
  // Test 8: Protected route without token (should fail)
  const protectedNoToken = await testEndpoint('Protected Route (No Token)', 'GET', '/api/protected');
  results.push({ name: 'Protected Route (No Token)', ...protectedNoToken });
  
  // Test 9: User info without token (should fail)
  const userinfoNoToken = await testEndpoint('User Info (No Token)', 'GET', '/api/auth/userinfo');
  results.push({ name: 'User Info (No Token)', ...userinfoNoToken });
  
  // Test 10: Invalid address for challenge
  const invalidChallenge = await testEndpoint('Invalid Address Challenge', 'GET', '/api/auth/challenge/invalid-address');
  results.push({ name: 'Invalid Address Challenge', ...invalidChallenge });
  
  // Summary
  console.log(`\n${colors.bold}${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    const status = result.success ? 
      `${colors.green}✅ PASS${colors.reset}` : 
      `${colors.red}❌ FAIL${colors.reset}`;
    
    console.log(`${result.name.padEnd(30)} ${status} (${result.status || 'N/A'})`);
    
    if (result.success) passed++;
    else failed++;
  });
  
  console.log('='.repeat(50));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📦 Package: @gitalien/auth_package@1.0.0${colors.reset}`);
  
  if (failed === 0) {
    log('green', '\n🎉 ALL TESTS PASSED! Your package is working correctly!');
  } else {
    log('yellow', '\n⚠️  Some tests failed, but this might be expected (e.g., auth failures)');
  }
  
  console.log(`\n${colors.blue}💡 Next Steps:${colors.reset}`);
  console.log('   1. Test with real wallet signatures');
  console.log('   2. Add Infura key for ENS resolution');
  console.log('   3. Test with MongoDB connection');
  console.log('   4. Deploy to production environment');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log(`${colors.bold}Checking if test server is running...${colors.reset}`);
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('red', '❌ Test server is not running!');
    console.log(`\n${colors.yellow}Please start the server first:${colors.reset}`);
    console.log('   cd test_project');
    console.log('   npm install');
    console.log('   npm start');
    console.log('\nThen run the tests again: npm test');
    process.exit(1);
  }
  
  log('green', '✅ Server is running! Starting tests...');
  await runTests();
}

main().catch(console.error);
