import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SiweMessage } from "siwe";
import dotenv from "dotenv";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

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
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

const ChallengeSchema = new mongoose.Schema({
  address: { type: String, required: true },
  challenge: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});
const Challenge = mongoose.model("Challenge", ChallengeSchema);

// Middleware
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

// Configure trust proxy if behind a proxy (e.g., Vite dev server)
app.set("trust proxy", 1);

// Rate limiting with proper IPv6 support
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

// Exempt /api/register-ip from rate limiting
app.use((req, res, next) => {
  if (req.path === '/api/register-ip') {
    return next();
  }
  next();
});

// GET: Issue SIWE challenge
app.get("/api/challenge/:address", async (req, res) => {
  const { address } = req.params;
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  try {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const domain = "http://localhost:5173"; // Explicit domain for development
    const uri = "http://localhost:5173";     // Explicit URI for development
    const message = new SiweMessage({
      domain,
      address,
      statement: "Sign in to access your account",
      uri,
      version: "1",
      chainId: 1, // Ethereum mainnet (adjust for testnets like Sepolia if needed)
      nonce,
    }).prepareMessage();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Challenge.create({ address, challenge: message, expiresAt, used: false });
    res.json({ challenge: message });
  } catch (err) {
    console.error("Challenge creation error:", err);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
});

// POST: Verify signature and issue JWT with background IP registration
app.post("/api/auth", async (req, res) => {
  const { address, signature } = req.body;
  console.log("Received auth request:", { address, signature }); // Debug log
  if (!ethers.isAddress(address) || typeof signature !== "string") {
    console.log("Validation failed:", { address, signature });
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  try {
    const stored = await Challenge.findOne({ address, used: false });
    if (!stored || stored.expiresAt < new Date()) {
      console.log("Challenge invalid or expired:", { stored });
      return res.status(400).json({ success: false, error: "Invalid or expired challenge" });
    }

    const siweMessage = new SiweMessage(stored.challenge);
    console.log("Verifying message:", stored.challenge); // Debug log
    const { data: fields } = await siweMessage.verify({ signature });
    console.log("Verification result:", fields); // Debug log

    if (fields.address.toLowerCase() !== address.toLowerCase()) {
      console.log("Address mismatch:", { fieldsAddress: fields.address, inputAddress: address });
      return res.status(400).json({ success: false, error: "Signature mismatch" });
    }

    stored.used = true;
    await stored.save();

    let user = await User.findOne({ address });
    const ip = req.ip || "unknown";
    if (!user) {
      user = await User.create({
        address,
        logins: [{ timestamp: new Date(), ip }],
      });
    } else {
      user.logins.push({ timestamp: new Date(), ip });
      await user.save();
    }

    // Trigger background IP registration
    registerIpInBackground(address, ip).catch(err => console.error("Background IP registration failed:", err));

    const token = jwt.sign({ address: user.address }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(400).json({ success: false, error: "Signature verification failed" });
  }
});

// Background function to register IP
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

// POST: Register IP from frontend (no verification or rate limiting)
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
    res.status(500).json({ success: false, error: "Failed to register IP" });
  }
});

// GET: User info (protected endpoint)
app.get("/api/userinfo", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ address: decoded.address });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      address: user.address,
      loginCount: user.logins.length,
      lastLogin: user.logins[user.logins.length - 1]?.timestamp,
      ensName: user.ensName || null,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
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
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// POST: Resolve ENS name
app.post("/api/resolve-ens", async (req, res) => {
  const { address } = req.body;
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "Invalid address" });

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.INFURA_KEY ? `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}` : "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
    );
    const ensName = await provider.lookupAddress(address);
    if (ensName) {
      await User.updateOne({ address }, { ensName });
    }
    res.json({ ensName: ensName || null });
  } catch (err) {
    console.error("ENS resolution error:", err);
    res.status(500).json({ error: "ENS resolution failed" });
  }
});

app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));