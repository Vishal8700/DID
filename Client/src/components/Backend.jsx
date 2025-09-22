import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; // ✅ add this
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // optional
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiClipboard, FiCheck } from 'react-icons/fi';
import './SIWEDocs.css';

// Markdown content with the file structure replaced by image markdown
const markdownContent = `
# SIWE Authentication System for Express

A modular Express.js authentication system implementing **Sign-In With Ethereum (SIWE)**, integrated with MongoDB for user and challenge almacenamiento, JWT for session management, rate limiting, and optional ENS resolution. Designed to be seamlessly integrated into any existing Express backend.

## Table of Contents
- [Overview](#Overview)
- [Features](#features)
- [Installation](#installation)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [GET /api/challenge/:address](#get-apichallengeaddress)
  - [POST /api/auth](#post-apiauth)
  - [POST /api/register-ip](#post-apiregister-ip)
  - [GET /api/userinfo](#get-apiuserinfo)
  - [GET /api/stats/users](#get-apistatsusers)
  - [POST /api/resolve-ens](#post-apiresolve-ens)
  - [POST /api/settings/relogin-period](#post-apisettingsrelogin-period)
- [Integration Guide](#integration-guide)
  - [Adding to Existing Routes](#adding-to-existing-routes)
  - [Using Blockchain ID](#using-blockchain-id)
  - [Frontend Integration](#frontend-integration)
- [Examples](#examples)
  - [Protecting a Custom Route](#protecting-a-custom-route)
  - [Linking Blockchain ID to Custom User Model](#linking-blockchain-id-to-custom-user-model)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview
This package provides a modular authentication system for Express.js, enabling users to sign in using their Ethereum wallet via SIWE. It stores user data (Ethereum address, login history, ENS name) in MongoDB, issues JSON Web Tokens (JWT) for session management, and supports rate limiting and optional ENS resolution. The system is designed to be dropped into any existing Express backend with minimal configuration.

## Features
- **SIWE Authentication**: Securely authenticate users via Ethereum wallet signatures.
- **MongoDB Storage**: Persist user data and authentication challenges.
- **JWT Sessions**: Issue and verify JWTs with configurable expiration.
- **Rate Limiting**: Prevent abuse with per-address/IP rate limits.
- **ENS Resolution**: Optionally resolve Ethereum Name Service (ENS) names.
- **Modular Design**: Organized into models, middleware, routes, and utilities for easy integration.

## Installation
1. **Install Dependencies**:
   \`\`\`bash
   npm install express cors siwe jsonwebtoken mongoose dotenv express-rate-limit ethers
   \`\`\`

2. **Set Up Directory Structure**:

![Directory Structure](./images/file_structure.png)

3. **Configure Environment Variables**:
   Create or update a \`.env\` file in your project root:
   \`\`\`env
   PORT=5000
   JWT_SECRET=your-secure-secret-key
   MONGODB_URI=your-mongodb-atlas-uri
   INFURA_KEY=your-infura-project-id # Optional for ENS
   \`\`\`

## Directory Structure
- \`auth/models/User.js\`: MongoDB schema for users (address, logins, ENS name, relogin period).
- \`auth/models/Challenge.js\`: MongoDB schema for SIWE challenges with auto-expiration.
- \`auth/middleware/authenticateJWT.js\`: Middleware to verify JWTs.
- \`auth/middleware/rateLimiter.js\`: Rate-limiting middleware.
- \`auth/utils/registerIpInBackground.js\`: Utility to log IP addresses asynchronously.
- \`auth/routes/authRoutes.js\`: Express router with all auth-related endpoints.


## Configuration
1. **MongoDB Connection**:
   In your main app file (e.g., \`app.js\`), add:
   \`\`\`javascript
   const mongoose = require('mongoose');
   const dotenv = require('dotenv');

   dotenv.config();

   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ Connected to MongoDB Atlas'))
     .catch(err => console.error('❌ MongoDB connection error:', err));
   \`\`\`

2. **Express Setup**:
   Ensure your Express app enables JSON parsing and trusts proxies:
   \`\`\`javascript
   const express = require('express');
   const app = express();

   app.set('trust proxy', 1);
   app.use(express.json());
   \`\`\`

3. **Mount Auth Routes**:
   In your main app file, mount the auth routes:
   \`\`\`javascript
   const authRoutes = require('./auth/routes/authRoutes');
   app.use('/api', authRoutes);
   \`\`\`

4. **Start Server**:
   If not already present, add:
   \`\`\`javascript
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(\`Server running on http://localhost:\${PORT}\`));
   \`\`\`

## API Reference

### GET /api/challenge/:address
Generates a SIWE challenge for the provided Ethereum address.

- **Parameters**:
  - \`address\` (path, required): Ethereum address (e.g., \`0x123...\`).
- **Response**:
  - \`200\`: \`{ challenge: string }\` - SIWE message to be signed.
  - \`400\`: Invalid Ethereum address.
  - \`500\`: Server error.
- **Example**:
  \`\`\`bash
  curl http://localhost:5000/api/challenge/0x1234567890123456789012345678901234567890
  \`\`\`

### POST /api/auth
Verifies a SIWE signature and issues a JWT.

- **Body**:
  - \`address\` (string, required): Ethereum address.
  - \`signature\` (string, required): Signed SIWE message.
- **Response**:
  - \`200\`: \`{ success: true, token: string }\` - JWT for authenticated session.
  - \`400\`: Invalid input, signature, or expired challenge.
- **Example**:
  \`\`\`javascript
  fetch('http://localhost:5000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: '0x123...', signature: '0xabc...' })
  });
  \`\`\`

### POST /api/register-ip
Registers a user’s IP address (bypasses rate limiting).

- **Body**:
  - \`address\` (string, required): Ethereum address.
  - \`ip\` (string, required): IP address to register.
- **Response**:
  - \`200\`: \`{ success: true, message: string }\`
  - \`400\`: Invalid address or IP.
  - \`500\`: Server error.

### GET /api/userinfo
Retrieves user information (protected route).

- **Headers**:
  - \`Authorization\`: \`Bearer <token>\`
- **Response**:
  - \`200\`: \`{ address: string, loginCount: number, lastLogin: Date, ensName: string|null, reloginPeriod: number }\`
  - \`401\`: Unauthorized (invalid/missing token).
  - \`404\`: User not found.
  - \`500\`: Server error.

### GET /api/stats/users
Returns user statistics (public, for developers).

- **Response**:
  - \`200\`: \`{ totalUsers: number, activeUsersLast30Days: number }\`
  - \`500\`: Server error.

### POST /api/resolve-ens
Resolves an ENS name for an Ethereum address (requires \`INFURA_KEY\`).

- **Body**:
  - \`address\` (string, required): Ethereum address.
- **Response**:
  - \`200\`: \`{ ensName: string|null }\`
  - \`400\`: Invalid address.
  - \`500\`: ENS resolution error.

### POST /api/settings/relogin-period
Sets the JWT expiration period (protected route).

- **Headers**:
  - \`Authorization\`: \`Bearer <token>\`
- **Body**:
  - \`period\` (number, required): Expiration in minutes.
- **Response**:
  - \`200\`: \`{ success: true, message: string, reloginPeriod: number }\`
  - \`400\`: Invalid period.
  - \`401\`: Unauthorized.
  - \`404\`: User not found.
  - \`500\`: Server error.

## Integration Guide

### Adding to Existing Routes
To protect existing routes with SIWE authentication and access the blockchain ID (Ethereum address):
1. Import the \`authenticateJWT\` middleware:
   \`\`\`javascript
   const authenticateJWT = require('./auth/middleware/authenticateJWT');
   \`\`\`
2. Apply it to your route and use \`req.user.address\`:
   \`\`\`javascript
   app.get('/api/protected', authenticateJWT, (req, res) => {
     res.json({ blockchainId: req.user.address, message: 'Protected data' });
   });
   \`\`\`


`;

const downloadZipUrl = '/downloads/backend-setup.zip'; // Adjust path as needed

const SIWEDocs = () => {
  return (
    <div className="siwe-docs">
      <ReactMarkdown
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug, // ✅ generate IDs for headings
          [rehypeAutolinkHeadings, { behavior: 'wrap' }], // optional
        ]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            const [copied, setCopied] = useState(false);

            if (!inline && match) {
              return (
                <div style={{ position: 'relative' }}>
                  <CopyToClipboard
                    text={codeText}
                    onCopy={() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    <button
                      aria-label="Copy code"
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copied ? 'green' : '#999',
                        fontSize: '1.2rem',
                        zIndex: 10,
                      }}
                    >
                      {copied ? <FiCheck /> : <FiClipboard />}
                    </button>
                  </CopyToClipboard>
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default SIWEDocs;