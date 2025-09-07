import express from "express";
import cors from "cors";
import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { ethers } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  logins: [{ timestamp: Date, ip: { type: String, default: "unknown" } }],
  ensName: String,
  reloginPeriod: { type: Number, default: 60 }, // In minutes, default 1 hour
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

const ChallengeSchema = new mongoose.Schema({
  address: { type: String, required: true },
  challenge: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});
// Auto-remove expired challenges
ChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Challenge = mongoose.model("Challenge", ChallengeSchema);

// Middleware
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

// Configure trust proxy
app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req, res) => {
    return req.params.address || ipKeyGenerator(req, res);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Exempt /api/register-ip
app.use((req, res, next) => {
  if (req.path === '/api/register-ip') {
    return next();
  }
  next();
});

// Middleware for JWT authentication (used for protected endpoints)
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token", details: err.message });
  }
};

// GET: Issue SIWE challenge
app.get("/api/challenge/:address", async (req, res) => {
  const { address } = req.params;
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  try {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const domain = "http://localhost:5173";
    const uri = "http://localhost:5173";
    const message = new SiweMessage({
      domain,
      address,
      statement: "Sign in to access your account",
      uri,
      version: "1",
      chainId: 1, // Ethereum mainnet for SIWE (off-chain)
      nonce,
    }).prepareMessage();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await Challenge.create({ address, challenge: message, expiresAt, used: false });
    console.log(`Challenge created for ${address}: ${message}`);
    res.json({ challenge: message });
  } catch (err) {
    console.error("Challenge creation error:", err);
    res.status(500).json({ error: "Failed to generate challenge", details: err.message });
  }
});

// POST: Verify signature off-chain and store in Mongo
app.post("/api/auth", async (req, res) => {
  const { address, signature } = req.body;
  console.log("Received auth request:", { address, signature });
  if (!ethers.isAddress(address) || typeof signature !== "string") {
    console.log("Validation failed:", { address, signature });
    return res.status(400).json({ success: false, error: "Invalid input: address or signature missing/invalid" });
  }

  try {
    const stored = await Challenge.findOne({ address, used: false });
    if (!stored || stored.expiresAt < new Date()) {
      console.log("Challenge invalid or expired:", { stored });
      return res.status(400).json({ success: false, error: "Invalid or expired challenge" });
    }

    const siweMessage = new SiweMessage(stored.challenge);
    const { data: fields } = await siweMessage.verify({ signature });
    console.log("Verification result:", fields);

    if (fields.address.toLowerCase() !== address.toLowerCase()) {
      console.log("Address mismatch:", { fieldsAddress: fields.address, inputAddress: address });
      return res.status(400).json({ success: false, error: "Signature mismatch: Address does not match" });
    }

    // Mark challenge as used
    stored.used = true;
    await stored.save();

    // Delete all other unused challenges for this user
    await Challenge.deleteMany({ address, used: false, _id: { $ne: stored._id } });

    let user = await User.findOne({ address });
    const ip = req.ip || "unknown";
    if (!user) {
      user = await User.create({
        address,
        logins: [{ timestamp: new Date(), ip }],
      });
      console.log(`New user created: ${address}`);
    } else {
      user.logins.push({ timestamp: new Date(), ip });
      await user.save();
      console.log(`User updated: ${address}`);
    }

    // Issue JWT with dynamic expiration based on user's reloginPeriod
    const reloginPeriod = user.reloginPeriod || 60; // Default to 60 minutes if not set
    const token = jwt.sign({ address: user.address }, JWT_SECRET, {
      expiresIn: `${reloginPeriod}m`,
      issuer: "Testnet Auth Server",
    });
    console.log(`Token issued for ${address} with expiration in ${reloginPeriod} minutes`);

    // Register IP in background
    registerIpInBackground(address, ip).catch(err => console.error("Background IP registration failed:", err));

    res.json({ success: true, token });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(400).json({ success: false, error: "Signature verification failed", details: err.message });
  }
});

async function registerIpInBackground(address, ip) {
  try {
    let user = await User.findOne({ address });
    if (!user) {
      await User.create({
        address,
        logins: [{ timestamp: new Date(), ip }],
      });
    } else {
      user.logins.push({ timestamp: new Date(), ip });
      await user.save();
    }
  } catch (err) {
    console.error("Background IP registration error:", err);
  }
}

// POST: Register IP from frontend
app.post("/api/register-ip", async (req, res) => {
  const { address, ip } = req.body;
  if (!ethers.isAddress(address) || typeof ip !== "string") {
    return res.status(400).json({ success: false, error: "Invalid address or IP" });
  }

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
    res.json({ success: true, message: "IP registered successfully" });
  } catch (err) {
    console.error("Register IP error:", err);
    res.status(500).json({ success: false, error: "Failed to register IP", details: err.message });
  }
});

// GET: User info
app.get("/api/userinfo", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ address: req.user.address });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      address: user.address,
      loginCount: user.logins.length,
      lastLogin: user.logins[user.logins.length - 1]?.timestamp,
      ensName: user.ensName || null,
      reloginPeriod: user.reloginPeriod,
    });
  } catch (err) {
    console.error("User info error:", err);
    res.status(500).json({ error: "Failed to fetch user info", details: err.message });
  }
});

// GET: Developer stats
app.get("/api/stats/users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsersLast30Days = await User.countDocuments({
      "logins.timestamp": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    res.json({ totalUsers, activeUsersLast30Days });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

// POST: Resolve ENS name (optional with improved error handling)
app.post("/api/resolve-ens", async (req, res) => {
  const { address } = req.body;
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "Invalid address" });

  if (!process.env.INFURA_KEY) {
    console.warn("ENS resolution skipped: INFURA_KEY not provided");
    return res.json({ ensName: null });
  }

  try {
    const provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
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
    console.error("ENS resolution error:", err);
    if (err.code === -32700) {
      return res.status(500).json({
        error: "ENS resolution failed due to invalid JSON response",
        details: "Please verify Infura project ID and network access.",
      });
    }
    res.status(500).json({ error: "ENS resolution failed", details: err.message });
  }
});

// POST: Set relogin period (authenticated)
app.post("/api/settings/relogin-period", authenticateJWT, async (req, res) => {
  const { period } = req.body;
  if (typeof period !== "number" || period <= 0) {
    return res.status(400).json({ error: "Invalid relogin period. Must be a positive number in minutes." });
  }

  try {
    const user = await User.findOne({ address: req.user.address });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.reloginPeriod = period;
    await user.save();
    res.json({ success: true, message: "Relogin period updated successfully", reloginPeriod: period });
  } catch (err) {
    console.error("Relogin period update error:", err);
    res.status(500).json({ error: "Failed to update relogin period", details: err.message });
  }
});

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));