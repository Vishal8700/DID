# Complete SIWE Authentication Integration Guide

## Using @gitalien/auth_package v1.2.0

This comprehensive guide shows you how to integrate secure wallet-based authentication in your application using our production-ready SIWE authentication package. 

## ✨ Why Choose Our Auth Package?

- **🚀 5-Minute Setup**: No complex configuration or multiple dependencies
- **🔒 Production Ready**: Built-in security, rate limiting, and error handling  
- **📦 All-in-One**: SIWE, JWT, MongoDB, ENS resolution in one package
- **🎯 Zero Templates**: Direct integration with your existing codebase
- **🛡️ Battle Tested**: Used in production applications
- **📚 Complete Documentation**: Every endpoint and feature documented

No templates to download, no complex setup - just install and integrate!

## 🚀 5-Minute Integration

### Step 1: Backend Setup (2 minutes)

**Install the authentication package:**
```bash
npm install @gitalien/auth_package@1.2.0
```

**That's it! No additional dependencies needed.** The package includes everything: SIWE, JWT, MongoDB integration, rate limiting, and ENS resolution.

**Create your server (server.js):**
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
  chainId: 1, // 1 for Ethereum, 137 for Polygon
  infuraKey: process.env.INFURA_KEY, // Optional for ENS resolution
});

// Mount auth routes - all endpoints will be available at /api/*
app.use('/api', authRouter);

// Example: Protect your existing routes
app.get('/api/user/profile', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  res.json({ 
    address: req.user.address,
    message: 'This is your protected profile data' 
  });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
```

**Environment Variables (.env):**
```env
# Required
MONGODB_URI=mongodb://localhost:27017/your-app-name
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Optional (for ENS name resolution)
INFURA_KEY=your-infura-project-id-here

# Server
PORT=5000
```

### Step 2: Frontend Setup (3 minutes)

**Install minimal dependencies:**
```bash
npm install ethers jwt-decode
```

**Only 2 dependencies needed!** Our package handles all the backend complexity.

**Complete Authentication Component:**
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

      // Optional: Resolve ENS name using your auth package
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

  // Authenticate with SIWE using your auth package
  const authenticate = async () => {
    if (!account) {
      setAuthStatus("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setAuthStatus("");

    try {
      // Step 1: Get challenge from your auth package
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
      
      // Verify account hasn't changed
      const currentAddress = await signer.getAddress();
      if (currentAddress.toLowerCase() !== account.toLowerCase()) {
        setAuthStatus("Account mismatch. Please reconnect your wallet.");
        setAccount(currentAddress);
        setIsLoading(false);
        return;
      }

      const signature = await signer.signMessage(challengeData.challenge);

      // Step 3: Send signature to your auth package for verification
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

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setAuthStatus("Wallet disconnected");
        setToken("");
        localStorage.removeItem("auth_token");
        setIsAuthenticated(false);
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newAddress = await signer.getAddress();
        if (newAddress.toLowerCase() !== account?.toLowerCase()) {
          setAccount(newAddress);
          setAuthStatus("Account changed. Please reconnect or sign in again.");
          setEnsName(null);
          setToken("");
          localStorage.removeItem("auth_token");
          setIsAuthenticated(false);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [account]);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const expTime = decoded.exp * 1000;
            if (expTime <= Date.now()) {
              setAuthStatus("Session expired. Please sign in again.");
              setToken("");
              localStorage.removeItem("auth_token");
              setIsAuthenticated(false);
            }
          }
        } catch (err) {
          console.error("Token decode error:", err);
        }
      }
    };
    
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token]);

  // Logout function
  const logout = () => {
    setToken("");
    setAccount("");
    setIsAuthenticated(false);
    setEnsName(null);
    localStorage.removeItem("auth_token");
    setAuthStatus("Logged out successfully");
  };

  // Authenticated view
  if (isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2>🎉 Welcome to Your App!</h2>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px', 
          margin: '20px 0' 
        }}>
          <p><strong>Connected as:</strong> {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
          <p><strong>Address:</strong> {account}</p>
          {ensName && <p><strong>ENS:</strong> {ensName}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={async () => {
              // Example: Fetch user info using your auth package
              try {
                const response = await fetch('http://localhost:5000/api/userinfo', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                console.log('User info:', data);
                alert(`Login count: ${data.loginCount}, Last login: ${new Date(data.lastLogin).toLocaleString()}`);
              } catch (err) {
                console.error('Error fetching user info:', err);
              }
            }}
            style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Get User Info
          </button>
          
          <button 
            onClick={logout}
            style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Login view
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Wallet Authentication</h2>
      <p>Connect your Ethereum wallet for secure, passwordless authentication</p>
      
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

## 📋 Available API Endpoints

Your auth package automatically provides these endpoints:

### Authentication
- `GET /api/challenge/:address` - Get SIWE challenge
- `POST /api/auth` - Verify signature and get JWT token

### User Management (Protected - requires JWT)
- `GET /api/userinfo` - Get user profile and login statistics
- `POST /api/settings/relogin-period` - Update JWT expiration time

### Utilities
- `GET /api/stats/users` - Get platform user statistics
- `POST /api/resolve-ens` - Resolve ENS names for addresses

## 🔧 Advanced Integration

### Protecting Your Existing Routes

```javascript
const { authenticateJWT } = require('@gitalien/auth_package');

// Protect individual routes
app.get('/api/user/dashboard', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  // req.user contains { address: '0x...' }
  res.json({ 
    message: 'Welcome to your dashboard',
    userAddress: req.user.address 
  });
});

// Protect entire route groups
app.use('/api/admin', authenticateJWT(process.env.JWT_SECRET));
app.get('/api/admin/users', (req, res) => {
  res.json({ message: 'Admin only content', user: req.user });
});
```

### Frontend API Calls with Authentication

```javascript
// Making authenticated requests
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('auth_token');
    window.location.reload();
    return;
  }
  
  return response.json();
};

// Usage examples
const getUserInfo = () => makeAuthenticatedRequest('/api/userinfo');
const updateReloginPeriod = (period) => makeAuthenticatedRequest('/api/settings/relogin-period', {
  method: 'POST',
  body: JSON.stringify({ period })
});
```

### React Context for Global Auth State

```jsx
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    const decoded = jwtDecode(newToken);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in components
const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <WalletAuth />;
  }
  
  return (
    <div>
      <h1>Welcome {user.address}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## 🚀 Production Deployment

### Zero-Config Production Setup
Our package is production-ready out of the box! Just update your environment variables:

```env
# Production MongoDB (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production-db

# Strong JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-long-random-secret-key-here

# Your production domain
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com

# Optional Infura for ENS (recommended for production)
INFURA_KEY=your-infura-project-id

# Production port
PORT=443
```

### Production Configuration
```javascript
// Same code works in production - just update the config!
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: process.env.CORS_ORIGINS.split(','),
  domain: 'yourapp.com',
  uri: 'https://yourapp.com',
  chainId: 1, // 1 for Ethereum, 137 for Polygon
  infuraKey: process.env.INFURA_KEY,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // Automatic production-grade rate limiting
  }
});
```

**🎯 That's it!** No additional configuration needed. The package automatically handles:
- ✅ Security headers and CORS
- ✅ Rate limiting with IPv6 support  
- ✅ MongoDB connection pooling
- ✅ JWT token validation
- ✅ Error handling and logging

## 🐛 Troubleshooting

### Common Issues

**"MetaMask not found"**
- Ensure MetaMask extension is installed
- Check if `window.ethereum` is available

**"Challenge expired"**
- Challenges expire in 15 minutes
- Generate a new challenge if authentication takes too long

**"CORS errors"**
- Add your frontend domain to `corsOrigins` in backend config
- Ensure protocol (http/https) matches between frontend and backend

**"MongoDB connection failed"**
- Verify MongoDB URI format
- For local: `mongodb://localhost:27017/dbname`
- For Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

**"Token expired"**
- Default JWT expiration is 60 minutes
- Users can update this via `/api/settings/relogin-period`

## 📱 Mobile Wallet Support

The package works with mobile wallets through WalletConnect. Add to your frontend:

```bash
npm install @walletconnect/web3-provider
```

```javascript
import WalletConnectProvider from "@walletconnect/web3-provider";

const provider = new WalletConnectProvider({
  infuraId: "your-infura-id",
});

await provider.enable();
const web3Provider = new ethers.providers.Web3Provider(provider);
```

## ✅ 5-Minute Setup Checklist

### Backend (2 minutes)
- [ ] `npm install @gitalien/auth_package@1.2.0`
- [ ] Create `.env` file with MongoDB URI and JWT secret
- [ ] Add 3 lines to your server.js
- [ ] Start your server

### Frontend (3 minutes)  
- [ ] `npm install ethers jwt-decode`
- [ ] Copy the WalletAuth component
- [ ] Update API endpoints to your server
- [ ] Test wallet connection

### Production (Optional)
- [ ] Update environment variables for production
- [ ] Deploy with HTTPS
- [ ] Done! 🚀

---

## 🎉 Congratulations!

You now have enterprise-grade wallet authentication with:

### 🔒 **Security Features**
- ✅ SIWE challenge/response authentication
- ✅ JWT token management with expiration
- ✅ Rate limiting with IPv6 support
- ✅ CORS protection and security headers

### 🚀 **Advanced Features**  
- ✅ ENS name resolution
- ✅ User analytics and login tracking
- ✅ MongoDB integration with connection pooling
- ✅ Account switching detection
- ✅ Session persistence

### 📦 **Developer Experience**
- ✅ Zero-config production deployment
- ✅ Complete TypeScript support
- ✅ Comprehensive error handling
- ✅ Full API documentation
- ✅ Production-tested reliability

**🎯 Total Setup Time:** 5 minutes  
**📦 Package:** `@gitalien/auth_package@1.2.0`  
**📄 License:** MIT  
**🛠️ Support:** Complete documentation and examples included

**Ready to scale!** Your authentication system can handle thousands of users out of the box.
