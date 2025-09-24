// Example usage of the SIWE Auth Package
const express = require('express');
const dotenv = require('dotenv');
const { initializeSwecAuth, authenticateJWT } = require('./index');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Initialize SIWE authentication
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/siwe-auth',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
  domain: 'localhost:3000',
  uri: 'http://localhost:3000',
  chainId: 1, // Ethereum mainnet
  infuraKey: process.env.INFURA_KEY, // Optional
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
});

// Mount auth routes
app.use('/api/auth', authRouter);

// Example protected route
app.get('/api/profile', authenticateJWT(process.env.JWT_SECRET || 'your-secret-key-here'), (req, res) => {
  res.json({
    message: 'This is a protected route!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example public route
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public route',
    endpoints: {
      auth: {
        challenge: 'GET /api/auth/challenge/:address',
        authenticate: 'POST /api/auth/auth',
        userinfo: 'GET /api/auth/userinfo (protected)',
        stats: 'GET /api/auth/stats/users',
        ens: 'POST /api/auth/resolve-ens',
        settings: 'POST /api/auth/settings/relogin-period (protected)'
      },
      example: {
        profile: 'GET /api/profile (protected)',
        public: 'GET /api/public'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api/public`);
  console.log(`🔐 Auth endpoints mounted at /api/auth/*`);
});

module.exports = app;
