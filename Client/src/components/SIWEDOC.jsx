import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { 
  FiClipboard, 
  FiCheck, 
  FiDownload, 
  FiBook, 
  FiSettings, 
  FiCode, 
  FiServer, 
  FiShield, 
  FiHelpCircle,
  FiMenu,
  FiX,
  FiLayers,
  FiGitBranch,
  FiDatabase,
  FiActivity
} from 'react-icons/fi';

const backendZipUrl = '/Backend-Setup/Backend-Setup.zip';
const frontendZipUrl = '/Frontend-Setup/Frontend-Setup.zip';

// Split content into sections
const sections = {
  overview: {
    title: 'Overview',
    icon: FiBook,
    content: `
# SIWE Authentication System for Express

A modular Express.js authentication system implementing **Sign-In With Ethereum (SIWE)**, integrated with MongoDB for user and challenge storage, JWT for session management, rate limiting, and optional ENS resolution. Designed to be seamlessly integrated into any existing Express backend, with a complementary React frontend for user authentication.

## What is SIWE?
Sign-In With Ethereum (SIWE) is a standard that allows users to authenticate with their Ethereum wallet instead of traditional username/password combinations. This provides:

- **Decentralized Identity**: No central authority controls your identity
- **Enhanced Security**: Cryptographic signatures prove ownership
- **User Control**: Users maintain full control of their authentication
- **No Passwords**: Eliminates password-related security risks
    `
  },
  features: {
    title: 'Features',
    icon: FiActivity,
    content: `
# Features

## Core Authentication Features
- **SIWE Authentication**: Securely authenticate users via Ethereum wallet signatures
- **JWT Sessions**: Issue and verify JWTs with configurable expiration
- **MongoDB Storage**: Persist user data and authentication challenges
- **Rate Limiting**: Prevent abuse with per-address/IP rate limits
- **ENS Resolution**: Optionally resolve Ethereum Name Service (ENS) names

## Development Features
- **Modular Design**: Organized into backend models, middleware, routes, utilities, and frontend hook/component for easy integration
- **React Hook**: Ready-to-use \`useSIWEAuth\` hook for frontend integration
- **TypeScript Support**: Full TypeScript support for type safety
- **Responsive UI**: Mobile-first responsive authentication components

## Security Features
- **Challenge-Response**: Secure challenge-response authentication flow
- **Token Expiration**: Configurable JWT expiration times
- **IP Registration**: Track and manage user IP addresses
- **CORS Protection**: Configurable cross-origin resource sharing
    `
  },
  installation: {
    title: 'Installation',
    icon: FiSettings,
    content: `
# Installation Guide

## Backend Setup

### 1. Install Dependencies
\`\`\`bash
npm install express cors siwe jsonwebtoken mongoose dotenv express-rate-limit ethers
\`\`\`

### 2. Set Up Directory Structure
Copy the following files into your project under an \`auth/\` directory:

\`\`\`
auth/
├── models/
│   ├── User.js
│   └── Challenge.js
├── middleware/
│   ├── authenticateJWT.js
│   └── rateLimiter.js
├── routes/
│   └── authRoutes.js
└── utils/
    └── registerIpInBackground.js
\`\`\`

### 3. Environment Configuration
Create or update a \`.env\` file in your project root:

\`\`\`env
PORT=5000
JWT_SECRET=your-secure-secret-key
MONGODB_URI=your-mongodb-atlas-uri
INFURA_KEY=your-infura-project-id # Optional for ENS
\`\`\`

## Frontend Setup

### 1. Install Dependencies
In your React project, install the required packages:

\`\`\`bash
npm install ethers jwt-decode react-router-dom
\`\`\`

Required packages:
- **ethers**: For Ethereum wallet interactions (e.g., MetaMask)
- **jwt-decode**: For decoding JWTs to check expiration
- **react-router-dom**: For routing (optional, if using routes)

### 2. Environment Configuration
Create a \`.env\` file in your React project root:

\`\`\`env
REACT_APP_API_URL=http://localhost:5000
\`\`\`

### 3. Directory Structure
Create the following structure in your React project:

\`\`\`
src/
├── components/
│   └── AuthComponent.js
├── hooks/
│   └── useSIWEAuth.js
└── pages/
    └── Dashboard.js
\`\`\`
    `
  },
  structure: {
    title: 'Directory Structure',
    icon: FiLayers,
    content: `
# Directory Structure

## Backend Structure
\`\`\`
auth/
├── models/
│   ├── User.js              # MongoDB schema for users
│   └── Challenge.js         # MongoDB schema for SIWE challenges
├── middleware/
│   ├── authenticateJWT.js   # JWT verification middleware
│   └── rateLimiter.js       # Rate limiting middleware
├── routes/
│   └── authRoutes.js        # Express router with auth endpoints
└── utils/
    └── registerIpInBackground.js  # IP registration utility
\`\`\`

## Frontend Structure
\`\`\`
src/
├── components/
│   └── AuthComponent.js     # React authentication component
├── hooks/
│   └── useSIWEAuth.js      # Custom SIWE authentication hook
├── pages/
│   └── Dashboard.js        # Protected dashboard page
└── utils/
    └── api.js              # API utility functions
\`\`\`

## File Descriptions

### Backend Files
- **User.js**: Defines the MongoDB schema for storing user data including Ethereum address, login history, ENS name, and relogin period
- **Challenge.js**: Manages SIWE challenges with automatic expiration
- **authenticateJWT.js**: Middleware that verifies JWT tokens and extracts user information
- **rateLimiter.js**: Implements rate limiting to prevent abuse
- **authRoutes.js**: Contains all authentication-related API endpoints
- **registerIpInBackground.js**: Utility for logging IP addresses asynchronously

### Frontend Files
- **AuthComponent.js**: Complete authentication UI with wallet connection and signing
- **useSIWEAuth.js**: React hook that manages authentication state and logic
- **Dashboard.js**: Example protected component for authenticated users
    `
  },
  configuration: {
    title: 'Configuration',
    icon: FiDatabase,
    content: `
# Configuration Guide

## Backend Configuration

### 1. MongoDB Connection
In your main app file (e.g., \`app.js\`), add:

\`\`\`javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
\`\`\`

### 2. Express Setup
Ensure your Express app enables JSON parsing and trusts proxies:

\`\`\`javascript
const express = require('express');
const app = express();

app.set('trust proxy', 1);
app.use(express.json());
\`\`\`

### 3. Mount Auth Routes
In your main app file, mount the auth routes:

\`\`\`javascript
const authRoutes = require('./auth/routes/authRoutes');
app.use('/api', authRoutes);
\`\`\`

### 4. Start Server
If not already present, add:

\`\`\`javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on http://localhost:\${PORT}\`));
\`\`\`

## Frontend Configuration

### 1. Environment Variables
Ensure the \`.env\` file in your React project includes the backend API URL:

\`\`\`env
REACT_APP_API_URL=http://localhost:5000
\`\`\`

### 2. CORS Configuration
Update the backend CORS settings in \`auth/routes/authRoutes.js\` to allow your frontend origin:

\`\`\`javascript
const cors = require('cors');
router.use(cors({ 
  origin: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
\`\`\`

### 3. Protected Routes
Protect routes using the \`isAuthenticated\` state from \`useSIWEAuth\`:

\`\`\`javascript
import { Navigate } from 'react-router-dom';
import { useSIWEAuth } from '../hooks/useSIWEAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSIWEAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
\`\`\`
    `
  },
  api: {
    title: 'API Reference',
    icon: FiServer,
    content: `
# API Reference

## Authentication Endpoints

### GET /api/challenge/:address
Generates a SIWE challenge for the provided Ethereum address.

**Parameters:**
- \`address\` (path, required): Ethereum address (e.g., \`0x123...\`)

**Response:**
- \`200\`: \`{ challenge: string }\` - SIWE message to be signed
- \`400\`: Invalid Ethereum address
- \`500\`: Server error

**Example:**
\`\`\`bash
curl http://localhost:5000/api/challenge/0x1234567890123456789012345678901234567890
\`\`\`

### POST /api/auth
Verifies a SIWE signature and issues a JWT.

**Body:**
- \`address\` (string, required): Ethereum address
- \`signature\` (string, required): Signed SIWE message

**Response:**
- \`200\`: \`{ success: true, token: string, isNewUser: boolean }\`
- \`400\`: Invalid input, signature, or expired challenge

**Example:**
\`\`\`javascript
fetch('http://localhost:5000/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: '0x123...', 
    signature: '0xabc...' 
  })
});
\`\`\`

### GET /api/userinfo
Retrieves user information (protected route).

**Headers:**
- \`Authorization\`: \`Bearer <token>\`

**Response:**
- \`200\`: User information object
- \`401\`: Unauthorized (invalid/missing token)
- \`404\`: User not found

**Example Response:**
\`\`\`json
{
  "address": "0x123...",
  "loginCount": 5,
  "lastLogin": "2025-01-08T10:30:00Z",
  "ensName": "user.eth",
  "reloginPeriod": 1440
}
\`\`\`

## Utility Endpoints

### POST /api/resolve-ens
Resolves an ENS name for an Ethereum address.

**Body:**
- \`address\` (string, required): Ethereum address

**Response:**
- \`200\`: \`{ ensName: string|null }\`
- \`400\`: Invalid address
- \`500\`: ENS resolution error

### GET /api/stats/users
Returns user statistics (public endpoint).

**Response:**
- \`200\`: \`{ totalUsers: number, activeUsersLast30Days: number }\`
- \`500\`: Server error

### POST /api/register-ip
Registers a user's IP address (bypasses rate limiting).

**Body:**
- \`address\` (string, required): Ethereum address
- \`ip\` (string, required): IP address to register

**Response:**
- \`200\`: \`{ success: true, message: string }\`
- \`400\`: Invalid address or IP
- \`500\`: Server error
    `
  },
  integration: {
    title: 'Integration Guide',
    icon: FiGitBranch,
    content: `
# Integration Guide

## Backend Integration

### Adding to Existing Routes
To protect existing backend routes with SIWE authentication:

1. **Import the middleware:**
\`\`\`javascript
const authenticateJWT = require('./auth/middleware/authenticateJWT');
\`\`\`

2. **Apply to your route:**
\`\`\`javascript
app.get('/api/protected', authenticateJWT, (req, res) => {
  // Access blockchain ID via req.user.address
  res.json({ 
    blockchainId: req.user.address, 
    message: 'Protected data' 
  });
});
\`\`\`

### Using Blockchain ID
The blockchain ID (\`req.user.address\`) is available in any route using \`authenticateJWT\`.

To link it to an existing user model:

1. **Update your model:**
\`\`\`javascript
const mongoose = require('mongoose');
const CustomUserSchema = new mongoose.Schema({
  email: String,
  username: String,
  blockchainId: { type: String, unique: true, sparse: true }
});
module.exports = mongoose.model('CustomUser', CustomUserSchema);
\`\`\`

2. **Link during authentication:**
\`\`\`javascript
// In auth/routes/authRoutes.js, after user.save()
const CustomUser = require('../../models/CustomUser');
await CustomUser.findOneAndUpdate(
  { email: userEmail }, // Your matching criteria
  { $set: { blockchainId: address } },
  { new: true, upsert: true }
);
\`\`\`

## Frontend Integration

### Using the SIWE Hook
The \`useSIWEAuth\` hook provides complete authentication state management:

\`\`\`javascript
import { useSIWEAuth } from '../hooks/useSIWEAuth';

const MyComponent = () => {
  const {
    account,           // Connected wallet address
    ensName,          // Resolved ENS name
    isLoading,        // Loading state
    authStatus,       // Status messages
    isAuthenticated,  // Authentication state
    connectWallet,    // Function to connect wallet
    authenticate,     // Function to authenticate
  } = useSIWEAuth({
    apiUrl: 'http://localhost:5000',
    onAuthSuccess: () => {
      // Callback on successful authentication
      console.log('Login successful!');
    }
  });

  // Your component logic here
};
\`\`\`

### Protected Routes
Create a wrapper component for protected routes:

\`\`\`javascript
import { Navigate } from 'react-router-dom';
import { useSIWEAuth } from '../hooks/useSIWEAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSIWEAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
\`\`\`

### Making Authenticated Requests
Include the JWT token in your API requests:

\`\`\`javascript
const makeAuthenticatedRequest = async (endpoint) => {
  const token = localStorage.getItem('Testnet_auth_token');
  
  const response = await fetch(\`\${API_URL}\${endpoint}\`, {
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

// Example usage
const userInfo = await makeAuthenticatedRequest('/api/userinfo');
\`\`\`
    `
  },
  examples: {
    title: 'Code Examples',
    icon: FiCode,
    content: `
# Code Examples

## Backend Examples

### Protecting a Custom Route
\`\`\`javascript
const authenticateJWT = require('./auth/middleware/authenticateJWT');
const User = require('./auth/models/User');

app.get('/api/custom/profile', authenticateJWT, async (req, res) => {
  try {
    const blockchainId = req.user.address;
    const user = await User.findOne({ address: blockchainId });
    
    res.json({
      blockchainId,
      loginCount: user.logins.length,
      lastLogin: user.logins[user.logins.length - 1]?.timestamp,
      ensName: user.ensName
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
\`\`\`

### Custom Middleware with SIWE
\`\`\`javascript
const authenticateJWT = require('./auth/middleware/authenticateJWT');

const requireAdminWallet = async (req, res, next) => {
  // First authenticate with SIWE
  authenticateJWT(req, res, () => {
    const adminWallets = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321'
    ];
    
    if (adminWallets.includes(req.user.address.toLowerCase())) {
      next();
    } else {
      res.status(403).json({ error: 'Admin wallet required' });
    }
  });
};

// Usage
app.get('/api/admin/users', requireAdminWallet, (req, res) => {
  // Admin-only functionality
});
\`\`\`

## Frontend Examples

### Custom Authentication Component
\`\`\`javascript
import React from 'react';
import { useSIWEAuth } from '../hooks/useSIWEAuth';

const CustomAuth = () => {
  const {
    account,
    ensName,
    isLoading,
    authStatus,
    isAuthenticated,
    connectWallet,
    authenticate,
  } = useSIWEAuth({
    apiUrl: 'http://localhost:5000',
    onAuthSuccess: () => {
      // Redirect or show success message
      window.location.href = '/dashboard';
    }
  });

  if (isAuthenticated) {
    return (
      <div className="p-4">
        <h2>Welcome!</h2>
        <p>Connected as: {ensName || \`\${account?.slice(0, 6)}...\${account?.slice(-4)}\`}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Login with Ethereum</h1>
      
      {authStatus && (
        <div className={\`p-3 rounded mb-4 \${
          authStatus.includes('Error') || authStatus.includes('failed')
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }\`}>
          {authStatus}
        </div>
      )}

      {account && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            Connected: {ensName || \`\${account.slice(0, 6)}...\${account.slice(-4)}\`}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={connectWallet}
          disabled={isLoading || !!account}
          className={\`w-full py-2 px-4 rounded font-medium \${
            isLoading || account
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }\`}
        >
          {isLoading ? 'Connecting...' : account ? '✓ Wallet Connected' : 'Connect Wallet'}
        </button>

        <button
          onClick={authenticate}
          disabled={isLoading || !account}
          className={\`w-full py-2 px-4 rounded font-medium \${
            isLoading || !account
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }\`}
        >
          {isLoading ? 'Authenticating...' : 'Sign In with Wallet'}
        </button>
      </div>
    </div>
  );
};

export default CustomAuth;
\`\`\`

### Using Authentication in Components
\`\`\`javascript
import { useSIWEAuth } from '../hooks/useSIWEAuth';

const UserProfile = () => {
  const { token, account, ensName } = useSIWEAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/userinfo', {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Address:</strong> {account}</p>
        <p><strong>ENS:</strong> {ensName || 'Not set'}</p>
        <p><strong>Login Count:</strong> {userData.loginCount}</p>
        <p><strong>Last Login:</strong> {new Date(userData.lastLogin).toLocaleString()}</p>
      </div>
    </div>
  );
};
\`\`\`
    `
  },
  security: {
    title: 'Security',
    icon: FiShield,
    content: `
# Security Considerations

## Environment Security

### JWT Secret
- **Use a strong, unique secret**: Generate a cryptographically secure secret for \`JWT_SECRET\`
- **Keep it secret**: Never commit secrets to version control
- **Rotate regularly**: Consider rotating JWT secrets periodically

\`\`\`bash
# Generate a secure secret
openssl rand -hex 32
\`\`\`

### HTTPS in Production
Always enable HTTPS in production to protect:
- JWT tokens in transit
- Wallet signatures
- User data

\`\`\`javascript
// Express HTTPS setup
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
\`\`\`

## CORS Configuration
Restrict origins to trusted frontend domains only:

\`\`\`javascript
// In authRoutes.js
const cors = require('cors');

router.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
\`\`\`

## Rate Limiting

### Adjust Rate Limits
Customize rate limiting based on your application needs:

\`\`\`javascript
// In rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Different limits for different endpoints
const challengeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // More generous for challenge generation
});
\`\`\`

### IP Whitelisting
For production applications, consider IP whitelisting for admin functions:

\`\`\`javascript
const adminIpWhitelist = ['192.168.1.100', '10.0.0.50'];

const checkAdminIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (adminIpWhitelist.includes(clientIP)) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied from this IP' });
  }
};
\`\`\`

## Database Security

### MongoDB Indexes
Ensure proper indexing for security and performance:

\`\`\`javascript
// In your database setup
db.users.createIndex({ "address": 1 }, { unique: true });
db.challenges.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.challenges.createIndex({ "address": 1 });
\`\`\`

### Input Validation
Always validate and sanitize inputs:

\`\`\`javascript
const { ethers } = require('ethers');

const validateEthereumAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// In your routes
app.post('/api/auth', (req, res) => {
  const { address, signature } = req.body;
  
  if (!validateEthereumAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }
  
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Proceed with authentication
});
\`\`\`

## Frontend Security

### Token Storage
Store JWTs securely in the frontend:

\`\`\`javascript
// Use httpOnly cookies when possible (requires backend support)
// Or use localStorage with proper security measures

const tokenManager = {
  setToken: (token) => {
    // Add timestamp for automatic cleanup
    const tokenData = {
      token,
      timestamp: Date.now()
    };
    localStorage.setItem('auth_token', JSON.stringify(tokenData));
  },
  
  getToken: () => {
    try {
      const data = localStorage.getItem('auth_token');
      if (!data) return null;
      
      const { token, timestamp } = JSON.parse(data);
      
      // Auto-cleanup old tokens (7 days)
      if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('auth_token');
        return null;
      }
      
      return token;
    } catch {
      localStorage.removeItem('auth_token');
      return null;
    }
  },
  
  clearToken: () => {
    localStorage.removeItem('auth_token');
  }
};
\`\`\`

### Content Security Policy
Implement CSP headers to prevent XSS attacks:

\`\`\`javascript
// In your Express app
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
\`\`\`

## ENS Security
When using ENS resolution:

\`\`\`javascript
// Validate ENS responses
const validateENSResponse = (ensName) => {
  if (!ensName) return null;
  
  // Basic validation for ENS format
  if (typeof ensName === 'string' && ensName.endsWith('.eth')) {
    return ensName;
  }
  
  return null;
};
\`\`\`
    `
  },
  troubleshooting: {
    title: 'Troubleshooting',
    icon: FiHelpCircle,
    content: `
# Troubleshooting Guide

## Common Backend Issues

### MongoDB Connection Errors
**Problem:** \`MongoNetworkError\` or connection timeouts

**Solutions:**
1. **Verify connection string:**
\`\`\`javascript
// Correct format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
\`\`\`

2. **Check network access:**
- Whitelist your IP in MongoDB Atlas
- Ensure firewall allows outbound connections on port 27017

3. **Test connection:**
\`\`\`javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
\`\`\`

### Invalid Signature Errors
**Problem:** \`Signature does not match\` errors during authentication

**Causes & Solutions:**
1. **Account mismatch:**
\`\`\`javascript
// Ensure the same account signs and authenticates
const currentAddress = await signer.getAddress();
if (currentAddress.toLowerCase() !== account.toLowerCase()) {
  throw new Error('Account mismatch');
}
\`\`\`

2. **Challenge expiration:**
\`\`\`javascript
// Check challenge timing
const challenge = await Challenge.findOne({ address });
if (!challenge || Date.now() > challenge.expiresAt) {
  throw new Error('Challenge expired');
}
\`\`\`

3. **Message format issues:**
\`\`\`javascript
// Ensure exact message format
const message = new SiweMessage({
  domain: req.get('host'),
  address: address,
  statement: 'Sign in with Ethereum to the app.',
  uri: origin,
  version: '1',
  chainId: 1,
  nonce: generateNonce(),
});
\`\`\`

### JWT Token Issues
**Problem:** \`Invalid token\` or \`Token expired\` errors

**Debugging steps:**
1. **Check token format:**
\`\`\`javascript
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token valid:', decoded);
} catch (error) {
  console.error('Token error:', error.message);
}
\`\`\`

2. **Verify JWT_SECRET consistency:**
\`\`\`bash
# Check if JWT_SECRET is set
echo $JWT_SECRET
# Or in Node.js
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
\`\`\`

3. **Check token expiration:**
\`\`\`javascript
const { jwtDecode } = require('jwt-decode');

try {
  const decoded = jwtDecode(token);
  console.log('Expires at:', new Date(decoded.exp * 1000));
  console.log('Current time:', new Date());
} catch (error) {
  console.error('Decode error:', error);
}
\`\`\`

## Common Frontend Issues

### MetaMask Not Found
**Problem:** \`window.ethereum\` is undefined

**Solutions:**
1. **Check MetaMask installation:**
\`\`\`javascript
const checkMetaMask = () => {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed. Please install MetaMask to continue.');
    window.open('https://metamask.io/download/', '_blank');
    return false;
  }
  return true;
};
\`\`\`

2. **Handle different wallet providers:**
\`\`\`javascript
const getProvider = () => {
  if (window.ethereum?.isMetaMask) {
    return window.ethereum;
  } else if (window.ethereum) {
    // Handle other wallets
    return window.ethereum;
  } else {
    throw new Error('No Ethereum wallet found');
  }
};
\`\`\`

### CORS Errors
**Problem:** \`Access-Control-Allow-Origin\` errors

**Solutions:**
1. **Backend CORS setup:**
\`\`\`javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
\`\`\`

2. **Development proxy (Vite):**
\`\`\`javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
\`\`\`

### Network Issues
**Problem:** Request timeouts or network errors

**Solutions:**
1. **Add request timeouts:**
\`\`\`javascript
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
\`\`\`

2. **Implement retry logic:**
\`\`\`javascript
const retryFetch = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
\`\`\`

## Performance Issues

### Rate Limiting Problems
**Problem:** \`Too many requests\` errors

**Solutions:**
1. **Adjust rate limits:**
\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increase limit
  message: 'Too many requests, please try again later.'
});
\`\`\`

2. **Implement user-specific limits:**
\`\`\`javascript
const createRateLimiter = (maxRequests = 10) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use address instead of IP for authenticated routes
      return req.user?.address || req.ip;
    }
  });
};
\`\`\`

### Memory Leaks
**Problem:** Increasing memory usage over time

**Solutions:**
1. **Clean up challenge records:**
\`\`\`javascript
// Set up automatic cleanup
setInterval(async () => {
  try {
    const result = await Challenge.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(\`Cleaned up \${result.deletedCount} expired challenges\`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour
\`\`\`

2. **Optimize database queries:**
\`\`\`javascript
// Use lean queries when you don't need full Mongoose documents
const users = await User.find({}).lean();

// Use select to limit fields
const userAddresses = await User.find({}).select('address ensName');
\`\`\`

## Debug Logging

### Enable Debug Mode
\`\`\`javascript
// In development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(\`\${req.method} \${req.path}\`, {
      body: req.body,
      headers: req.headers,
      ip: req.ip
    });
    next();
  });
}
\`\`\`

### Frontend Debugging
\`\`\`javascript
// Add to useSIWEAuth hook
const [debugMode] = useState(process.env.NODE_ENV === 'development');

const debugLog = (message, data) => {
  if (debugMode) {
    console.log(\`[SIWE DEBUG] \${message}\`, data);
  }
};

// Use throughout the hook
debugLog('Connecting to wallet', { account });
debugLog('Authentication response', result);
\`\`\`
    `
  }
};

const SIWEDocs = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentSection = sections[activeSection];
  const navigate = useNavigate();

  const navigationItems = [
    { key: 'overview', ...sections.overview },
    { key: 'features', ...sections.features },
    { key: 'installation', ...sections.installation },
    { key: 'structure', ...sections.structure },
    { key: 'configuration', ...sections.configuration },
    { key: 'api', ...sections.api },
    { key: 'integration', ...sections.integration },
    { key: 'examples', ...sections.examples },
    { key: 'security', ...sections.security },
    { key: 'troubleshooting', ...sections.troubleshooting },
  ];

  const renderCodeWithCopy = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeText = String(children).replace(/\n$/, '');
    const [codeCopied, setCodeCopied] = useState(false);

    if (!inline && match) {
      return (
        <div className="relative group">
          <CopyToClipboard
            text={codeText}
            onCopy={() => {
              setCodeCopied(true);
              setTimeout(() => setCodeCopied(false), 2000);
            }}
          >
            <button
              aria-label="Copy code"
              className="absolute right-3 top-3 p-2 bg-gray-800 text-gray-300 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-700 hover:text-white z-10"
            >
              {codeCopied ? <FiCheck className="w-4 h-4" /> : <FiClipboard className="w-4 h-4" />}
            </button>
          </CopyToClipboard>
          <SyntaxHighlighter
            style={tomorrow}
            language={match[1]}
            PreTag="div"
            className="rounded-lg"
            {...props}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      );
    } else {
      return (
        <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-sm font-mono`} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10">
            <img
              src="/icon.png"
              alt="Shield"
              className="w-10 h-10 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
          </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">DID Auth</h1>
              <p className="text-sm text-gray-500">Authentication Guide</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Download buttons in sidebar */}
        <div className="p-6 border-b border-gray-100">
          <div className="space-y-3">
            <a
              href={backendZipUrl}
              download
              className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
              <span className="font-medium">Download Backend</span>
            </a>
            <a
              href={frontendZipUrl}
              download
              className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
              <span className="font-medium">Download Frontend</span>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${activeSection === item.key
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${activeSection === item.key ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.title}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  SIWE Authentication System Documentation
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                ]}
                components={{
                  code: renderCodeWithCopy,
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 my-4 text-blue-800">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {children}
                    </td>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">
                      {children}
                    </em>
                  ),
                }}
              >
                {currentSection.content}
              </ReactMarkdown>
            </div>

            {/* Navigation footer */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <div>
                {navigationItems.findIndex(item => item.key === activeSection) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = navigationItems.findIndex(item => item.key === activeSection);
                      setActiveSection(navigationItems[currentIndex - 1].key);
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>← Previous</span>
                  </button>
                )}
              </div>
              <div>
                {navigationItems.findIndex(item => item.key === activeSection) < navigationItems.length - 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = navigationItems.findIndex(item => item.key === activeSection);
                      setActiveSection(navigationItems[currentIndex + 1].key);
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>Next →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SIWEDocs;