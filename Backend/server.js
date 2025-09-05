import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { ethers } from "ethers";

// In-memory challenge storage. For production use Redis/db!
const challenges = {}; // { [address]: { challenge, expiresAt, used } }

const app = express();
const PORT = 5000;

// Only allow trusted frontends
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-production-frontend.com"], // edit as needed
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// GET: Issue a new challenge for the address (5 minutes expiry)
app.get("/api/challenge/:address", (req, res) => {
  const { address } = req.params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }
  const challenge = ethers.hexlify(ethers.randomBytes(32));
  const expiresAt = Date.now() + 5 * 60 * 1000;
  challenges[address] = { challenge, expiresAt, used: false };
  res.json({ challenge });
});

// POST: Verify challenge signature
app.post("/api/auth", async (req, res) => {
  const { address, signature } = req.body;

  // Validate input format
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ success: false, error: "Invalid address" });
  }
  if (typeof signature !== "string" || signature.length < 66) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  // Look up the challenge
  const stored = challenges[address];
  if (!stored || stored.used || stored.expiresAt < Date.now()) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or expired challenge" });
  }
  const { challenge } = stored;

  try {
    const recovered = ethers.verifyMessage(challenge, signature);
    if (recovered.toLowerCase() === address.toLowerCase()) {
      stored.used = true;
      // Session/token/JWT logic can go here!
      return res.json({ success: true });
    } else {
      return res.json({ success: false, error: "Signature does not match address" });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running securely on http://localhost:${PORT}`);
});
