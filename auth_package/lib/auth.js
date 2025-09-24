const mongoose = require('mongoose');
const express = require("express");
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { ethers } = require('ethers');
const { SiweMessage } = require('siwe');
const jwt = require('jsonwebtoken');
const { User, Challenge } = require('./schemas');

function setupAuthRoutes(router, config) {
  const {
    mongoUri,
    jwtSecret,
    corsOrigins = ['http://localhost:5173'],
    rateLimit: rateLimitConfig = { windowMs: 15 * 60 * 1000, max: 100 },
    domain = 'http://localhost:5173',
    uri = 'http://localhost:5173',
    chainId = 1,
    infuraKey = null, // Optional Infura key for ENS resolution
  } = config;

  // Connect to MongoDB
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

  // Middleware
  router.use(cors({ origin: corsOrigins }));
  router.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    ...rateLimitConfig,
    keyGenerator: (req, res) => {
      return req.params.address || ipKeyGenerator(req, res);
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  router.use(limiter);

  // GET: Issue SIWE challenge
  router.get('/challenge/:address', async (req, res) => {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    try {
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const message = new SiweMessage({
        domain,
        address,
        statement: 'Sign in to access your account',
        uri,
        version: '1',
        chainId,
        nonce,
      }).prepareMessage();

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await Challenge.create({ address, challenge: message, expiresAt: expiresAt, used: false });
      console.log(`Challenge created for ${address}: ${message}`);
      res.json({ challenge: message });
    } catch (err) {
      console.error('Challenge creation error:', err);
      res.status(500).json({ error: 'Failed to generate challenge', details: err.message });
    }
  });

  // POST: Verify signature and issue JWT
  router.post('/auth', async (req, res) => {
    const { address, signature } = req.body;
    if (!ethers.isAddress(address) || typeof signature !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid input: address or signature missing/invalid' });
    }

    try {
      const stored = await Challenge.findOne({ address, used: false });
      if (!stored || stored.expiresAt < new Date()) {
        return res.status(400).json({ success: false, error: 'Invalid or expired challenge' });
      }

      const siweMessage = new SiweMessage(stored.challenge);
      const { data: fields } = await siweMessage.verify({ signature });

      if (fields.address.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({ success: false, error: 'Signature mismatch: Address does not match' });
      }

      // Mark challenge as used
      stored.used = true;
      await stored.save();

      // Delete other unused challenges
      await Challenge.deleteMany({ address, used: false, _id: { $ne: stored._id } });

      let user = await User.findOne({ address });
      const ip = req.ip || 'unknown';
      if (!user) {
        user = await User.create({
          address,
          logins: [{ timestamp: new Date(), ip }],
        });
      } else {
        user.logins.push({ timestamp: new Date(), ip });
        await user.save();
      }

      // Issue JWT
      const reloginPeriod = user.reloginPeriod || 60;
      const token = jwt.sign({ address: user.address }, jwtSecret, {
        expiresIn: `${reloginPeriod}m`,
        issuer: 'SWEC Auth',
      });

      res.json({ success: true, token });
    } catch (err) {
      console.error('Auth error:', err);
      res.status(400).json({ success: false, error: 'Signature verification failed', details: err.message });
    }
  });

  // GET: User info (authenticated)
  router.get('/userinfo', authenticateJWT(jwtSecret), async (req, res) => {
    try {
      const user = await User.findOne({ address: req.user.address });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
        address: user.address,
        loginCount: user.logins.length,
        lastLogin: user.logins[user.logins.length - 1]?.timestamp,
        ensName: user.ensName || null,
        reloginPeriod: user.reloginPeriod,
      });
    } catch (err) {
      console.error('User info error:', err);
      res.status(500).json({ error: 'Failed to fetch user info', details: err.message });
    }
  });

  // GET: Developer stats
  router.get('/stats/users', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsersLast30Days = await User.countDocuments({
        'logins.timestamp': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
      res.json({ totalUsers, activeUsersLast30Days });
    } catch (err) {
      console.error('Stats error:', err);
      res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
  });

  // POST: Resolve ENS name (optional with improved error handling)
  router.post('/resolve-ens', async (req, res) => {
    const { address } = req.body;
    if (!ethers.isAddress(address)) return res.status(400).json({ error: 'Invalid address' });

    // Check if Infura key is provided in config
    if (!infuraKey) {
      console.warn('ENS resolution skipped: INFURA_KEY not provided');
      return res.json({ ensName: null });
    }

    try {
      const provider = new ethers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${infuraKey}`
      );
      await provider.getNetwork();
      const ensName = await provider.lookupAddress(address);

      let user = await User.findOne({ address });
      if (!user) {
        user = await User.create({ address });
      }
      if (ensName) {
        await User.updateOne({ address }, { ensName });
      }
      res.json({ ensName: ensName || null });
    } catch (err) {
      console.error('ENS resolution error:', err);
      if (err.code === -32700) {
        return res.status(500).json({
          error: 'ENS resolution failed due to invalid JSON response',
          details: 'Please verify Infura project ID and network access.',
        });
      }
      res.status(500).json({ error: 'ENS resolution failed', details: err.message });
    }
  });

  // POST: Set relogin period (authenticated)
  router.post('/settings/relogin-period', authenticateJWT(jwtSecret), async (req, res) => {
    const { period } = req.body;
    if (typeof period !== 'number' || period <= 0) {
      return res.status(400).json({ error: 'Invalid relogin period. Must be a positive number in minutes.' });
    }

    try {
      const user = await User.findOne({ address: req.user.address });
      if (!user) return res.status(404).json({ error: 'User not found' });

      user.reloginPeriod = period;
      await user.save();
      res.json({ success: true, message: 'Relogin period updated successfully', reloginPeriod: period });
    } catch (err) {
      console.error('Relogin period update error:', err);
      res.status(500).json({ error: 'Failed to update relogin period', details: err.message });
    }
  });
}

// JWT authentication middleware
function authenticateJWT(jwtSecret) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid or expired token", details: err.message });
    }
  };
}

async function registerIpInBackground(address, ip) {
  try {
    let user = await User.findOne({ address });
    if (!user) {
      user = await User.create({
        address,
        logins: [{ timestamp: new Date(), ip }],
      });
    } else {
      user.logins.push({ timestamp: new Date(), ip });
      await user.save();
    }
  } catch (err) {
    console.error('Background IP registration error:', err);
  }
}

module.exports = {
  setupAuthRoutes,
  authenticateJWT,
  registerIpInBackground,
};