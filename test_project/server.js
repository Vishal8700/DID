const express = require('express');
const dotenv = require('dotenv');
const { initializeSwecAuth, authenticateJWT } = require('@gitalien/auth_package');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

console.log('🔧 Initializing SIWE Auth Package...');

// Initialize SIWE authentication with your published package
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'],
  domain: 'localhost:3001',
  uri: 'http://localhost:3001',
  chainId: 1, // Ethereum mainnet
  infuraKey: process.env.INFURA_KEY, // Optional
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
});

console.log('✅ SIWE Auth Package initialized successfully!');

// Mount auth routes
app.use('/api/auth', authRouter);

// Test routes to verify functionality
app.get('/', (req, res) => {
  res.json({
    message: '🚀 SIWE Auth Test Server Running!',
    package: '@gitalien/auth_package@1.0.0',
    endpoints: {
      auth: {
        challenge: 'GET /api/auth/challenge/:address',
        authenticate: 'POST /api/auth/auth',
        userinfo: 'GET /api/auth/userinfo (requires JWT)',
        stats: 'GET /api/auth/stats/users',
        ens: 'POST /api/auth/resolve-ens',
        settings: 'POST /api/auth/settings/relogin-period (requires JWT)'
      },
      test: {
        protected: 'GET /api/protected (requires JWT)',
        public: 'GET /api/public'
      }
    },
    testInstructions: {
      step1: 'GET /api/auth/challenge/0x742d35Cc6634C0532925a3b8D9C9C0C9C0C9C0C9',
      step2: 'POST /api/auth/auth with address and signature',
      step3: 'Use returned JWT token in Authorization header for protected routes'
    }
  });
});

// Example protected route using the auth package middleware
app.get('/api/protected', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  res.json({
    message: '🔐 This is a protected route!',
    user: req.user,
    timestamp: new Date().toISOString(),
    success: true
  });
});

// Example public route
app.get('/api/public', (req, res) => {
  res.json({
    message: '🌍 This is a public route',
    package: '@gitalien/auth_package',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    package: '@gitalien/auth_package',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Test Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/`);
  console.log(`🔐 Auth endpoints mounted at /api/auth/*`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
  console.log(`\n📋 Quick Test Commands:`);
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(`   curl http://localhost:${PORT}/api/auth/stats/users`);
  console.log(`   curl http://localhost:${PORT}/api/public`);
  console.log(`\n🧪 Run automated tests: npm test\n`);
});

module.exports = app;
