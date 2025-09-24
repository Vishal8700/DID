# SIWE Auth Package Test Project

This project tests the published `@gitalien/auth_package` to verify all functionality works correctly.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the test server
npm start

# 3. In another terminal, run tests
npm test
```

## What This Tests

### ✅ Core Functionality
- Package installation and import
- SIWE auth router initialization
- MongoDB connection (if available)
- JWT middleware functionality

### ✅ API Endpoints
- `GET /api/auth/challenge/:address` - Challenge generation
- `POST /api/auth/auth` - Authentication (with invalid signature test)
- `GET /api/auth/userinfo` - User info (protected)
- `GET /api/auth/stats/users` - User statistics
- `POST /api/auth/resolve-ens` - ENS resolution
- `POST /api/auth/settings/relogin-period` - Settings (protected)

### ✅ Security Features
- JWT authentication middleware
- Rate limiting
- CORS configuration
- Input validation

### ✅ Error Handling
- Invalid addresses
- Missing tokens
- Invalid signatures
- 404 routes

## Manual Testing

### 1. Start Server
```bash
npm start
```

### 2. Test Endpoints

**Get Challenge:**
```bash
curl http://localhost:3001/api/auth/challenge/0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8
```

**Get Stats:**
```bash
curl http://localhost:3001/api/auth/stats/users
```

**Test Protected Route (should fail):**
```bash
curl http://localhost:3001/api/protected
```

**Test Public Route:**
```bash
curl http://localhost:3001/api/public
```

### 3. Automated Tests
```bash
npm test
```

## Configuration

Edit `.env` file for your setup:

```env
MONGODB_URI=mongodb://localhost:27017/siwe-auth-test
JWT_SECRET=super-secret-jwt-key-for-testing-12345
INFURA_KEY=your-infura-project-id-here
PORT=3001
```

## Expected Results

- ✅ Server starts without errors
- ✅ All public endpoints return 200
- ✅ Protected endpoints return 401 without token
- ✅ Challenge generation works
- ✅ Stats endpoint returns user counts
- ✅ ENS resolution handles missing Infura key gracefully

## Package Verification

This project confirms that `@gitalien/auth_package@1.0.0`:
- ✅ Installs correctly from npm
- ✅ Exports all required functions
- ✅ Initializes without errors
- ✅ Provides all documented endpoints
- ✅ Handles authentication properly
- ✅ Includes proper error handling
- ✅ Works as a drop-in solution

## Troubleshooting

**MongoDB Connection Issues:**
- Make sure MongoDB is running locally
- Or update MONGODB_URI to use MongoDB Atlas

**Port Conflicts:**
- Change PORT in .env file
- Update BASE_URL in test-endpoints.js

**Package Issues:**
- Verify package installed: `npm list @gitalien/auth_package`
- Check for latest version: `npm info @gitalien/auth_package`
