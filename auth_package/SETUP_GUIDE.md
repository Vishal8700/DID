# Complete SIWE Authentication Setup Guide

This guide shows you how to set up complete wallet-based authentication using `@gitalien/auth_package` with both backend and frontend implementation.

## 🚀 Quick Start

### 1. Backend Setup (3 minutes)

```bash
# Install the package
npm install @gitalien/auth_package

# Install peer dependencies if not already installed
npm install express mongoose cors dotenv
```

**server.js:**
```javascript
const express = require('express');
const dotenv = require('dotenv');
const { initializeSwecAuth, authenticateJWT } = require('@gitalien/auth_package');

dotenv.config();
const app = express();

// Basic middleware
app.use(express.json());

// Initialize SIWE authentication
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
  domain: 'localhost:5000',
  uri: 'http://localhost:5000',
  chainId: 1,
  infuraKey: process.env.INFURA_KEY, // Optional for ENS
});

// Mount auth routes
app.use('/api', authRouter);

// Example protected route
app.get('/api/protected', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  res.json({ user: req.user, message: 'Access granted!' });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
```

**Environment Variables (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/your-app
JWT_SECRET=your-super-secret-jwt-key-here
INFURA_KEY=your-infura-project-id-for-ens
```

### 2. Frontend Setup (React)

**Install dependencies:**
```bash
npm install ethers jwt-decode
```

**Complete React Component:**
```jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

function WalletAuth() {
  const [account, setAccount] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp) {
          const expTime = decoded.exp * 1000;
          if (expTime > Date.now()) {
            setIsAuthenticated(true);
            return;
          } else {
            setAuthStatus("Session expired. Please sign in again.");
            setToken("");
            localStorage.removeItem("auth_token");
          }
        }
      } catch (err) {
        console.error("Invalid token:", err);
        setToken("");
        localStorage.removeItem("auth_token");
      }
    }
  }, [token]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setAuthStatus("MetaMask not found! Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setAuthStatus("Wallet connected successfully!");

      // Optional: Resolve ENS name
      try {
        const ensRes = await fetch("http://localhost:5000/api/resolve-ens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        const ensData = await ensRes.json();
        if (ensData.ensName) {
          setEnsName(ensData.ensName);
        }
      } catch (err) {
        console.error("ENS resolution error:", err);
      }
    } catch (err) {
      setAuthStatus("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", err);
    }
  };

  // Authenticate with SIWE
  const authenticate = async () => {
    if (!account) {
      setAuthStatus("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setAuthStatus("");

    try {
      // Step 1: Get challenge from backend
      const challengeRes = await fetch(`http://localhost:5000/api/challenge/${account}`);
      const challengeData = await challengeRes.json();
      
      if (challengeData.error) {
        setAuthStatus(`Error: ${challengeData.error}`);
        setIsLoading(false);
        return;
      }

      // Step 2: Sign the challenge
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(challengeData.challenge);

      // Step 3: Send signature to backend for verification
      const authRes = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature }),
      });

      const result = await authRes.json();

      if (result.success && result.token) {
        localStorage.setItem("auth_token", result.token);
        setToken(result.token);
        setAuthStatus("✅ Authentication successful!");
        
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 1500);
      } else {
        setAuthStatus(`Authentication failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      setAuthStatus("Authentication failed. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setAuthStatus("Wallet disconnected");
        setToken("");
        localStorage.removeItem("auth_token");
        setIsAuthenticated(false);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  // Logout function
  const logout = () => {
    setToken("");
    setAccount("");
    setIsAuthenticated(false);
    localStorage.removeItem("auth_token");
    setAuthStatus("Logged out successfully");
  };

  if (isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🎉 Welcome!</h2>
        <p>You are authenticated with: {ensName || account}</p>
        <button onClick={logout} style={{ padding: '10px 20px', margin: '10px' }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Wallet Authentication</h2>
      
      {authStatus && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: authStatus.includes('failed') || authStatus.includes('Error') ? '#ffebee' : '#e8f5e8',
          border: '1px solid ' + (authStatus.includes('failed') || authStatus.includes('Error') ? '#f44336' : '#4caf50'),
          borderRadius: '4px'
        }}>
          {authStatus}
        </div>
      )}

      {account && (
        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', margin: '10px 0' }}>
          Connected: {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={connectWallet}
          disabled={isLoading || account}
          style={{
            padding: '12px 24px',
            backgroundColor: account ? '#4caf50' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: account ? 'default' : 'pointer',
            opacity: account ? 0.7 : 1
          }}
        >
          {account ? "✅ Wallet Connected" : "Connect Wallet"}
        </button>

        <button
          onClick={authenticate}
          disabled={isLoading || !account}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!account || isLoading) ? 'default' : 'pointer',
            opacity: (!account || isLoading) ? 0.5 : 1
          }}
        >
          {isLoading ? "Authenticating..." : "🔐 Authenticate with Wallet"}
        </button>
      </div>
    </div>
  );
}

export default WalletAuth;
```

## 📋 API Endpoints Reference

Your backend automatically provides these endpoints:

### Authentication
- `GET /api/challenge/:address` - Get SIWE challenge
- `POST /api/auth` - Verify signature and get JWT token

### User Management (Protected)
- `GET /api/userinfo` - Get user profile and stats
- `POST /api/settings/relogin-period` - Update JWT expiration time

### Utilities
- `GET /api/stats/users` - Get platform statistics
- `POST /api/resolve-ens` - Resolve ENS names

## 🔧 Advanced Configuration

### Custom Domain Setup
```javascript
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: ['https://yourapp.com'],
  domain: 'yourapp.com',
  uri: 'https://yourapp.com',
  chainId: 1, // 1 for Ethereum, 137 for Polygon
  infuraKey: process.env.INFURA_KEY,
});
```

### Multiple Environment Support
```javascript
// Development
const devAuthRouter = initializeSwecAuth({
  mongoUri: process.env.DEV_MONGODB_URI,
  jwtSecret: process.env.DEV_JWT_SECRET,
  corsOrigins: ['http://localhost:3000'],
  domain: 'localhost:3000',
  uri: 'http://localhost:3000',
});

// Production
const prodAuthRouter = initializeSwecAuth({
  mongoUri: process.env.PROD_MONGODB_URI,
  jwtSecret: process.env.PROD_JWT_SECRET,
  corsOrigins: ['https://yourapp.com'],
  domain: 'yourapp.com',
  uri: 'https://yourapp.com',
});

app.use('/api', process.env.NODE_ENV === 'production' ? prodAuthRouter : devAuthRouter);
```

### Protected Routes Example
```javascript
// Protect individual routes
app.get('/api/profile', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  res.json({ 
    address: req.user.address,
    message: 'This is your protected profile data' 
  });
});

// Protect entire route groups
app.use('/api/admin', authenticateJWT(process.env.JWT_SECRET));
app.get('/api/admin/dashboard', (req, res) => {
  res.json({ data: 'Admin only data', user: req.user });
});
```

## 🎯 Frontend Integration Patterns

### With React Context
```jsx
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### With Next.js API Routes
```javascript
// pages/api/auth/[...nextauth].js
import { initializeSwecAuth } from '@gitalien/auth_package';

const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: [process.env.NEXTAUTH_URL],
});

export default function handler(req, res) {
  return authRouter(req, res);
}
```

## 🔒 Security Best Practices

### Environment Variables
```env
# Use strong, unique secrets
JWT_SECRET=your-256-bit-secret-key-here-make-it-very-long-and-random

# Use MongoDB Atlas for production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Optional but recommended for ENS
INFURA_KEY=your-infura-project-id

# Set appropriate CORS origins
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### Production Deployment
1. **Use HTTPS everywhere**
2. **Set specific CORS origins** (not wildcards)
3. **Use environment variables** for all secrets
4. **Enable rate limiting** (included by default)
5. **Use MongoDB Atlas** or secure self-hosted MongoDB
6. **Monitor JWT expiration** and refresh tokens appropriately

## 🐛 Troubleshooting

### Common Issues

**"MetaMask not found"**
- Ensure MetaMask is installed
- Check if `window.ethereum` is available

**"Challenge expired"**
- Challenges expire in 15 minutes
- Generate a new challenge if needed

**"Signature verification failed"**
- Ensure the correct account is selected in MetaMask
- Check that the address matches the challenge

**"CORS errors"**
- Add your frontend URL to `corsOrigins` in backend config
- Ensure protocol (http/https) matches

**"MongoDB connection failed"**
- Check MongoDB URI format
- Ensure MongoDB is running (local) or accessible (Atlas)

### Debug Mode
```javascript
// Enable detailed logging
const authRouter = initializeSwecAuth({
  // ... your config
  debug: true, // Add this for detailed logs
});
```

## 📱 Mobile Support

The package works with mobile wallets through WalletConnect:

```jsx
// Add WalletConnect support
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const walletconnect = new WalletConnectConnector({
  rpc: { 1: process.env.REACT_APP_RPC_URL_1 },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});
```

## 🚀 Production Checklist

- [ ] Strong JWT secret (256+ bits)
- [ ] HTTPS enabled
- [ ] Specific CORS origins set
- [ ] MongoDB Atlas or secure MongoDB
- [ ] Environment variables configured
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Token refresh logic added
- [ ] Mobile wallet support tested
- [ ] ENS resolution configured (optional)

---

## 💡 Need Help?

This package provides a complete, production-ready SIWE authentication solution. If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your environment variables
3. Test with the provided examples
4. Check browser console for detailed error messages

Your authentication system is now ready for production! 🎉
