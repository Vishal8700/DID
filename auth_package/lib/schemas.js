const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  logins: [{ timestamp: Date, ip: { type: String, default: 'unknown' } }],
  ensName: String,
  reloginPeriod: { type: Number, default: 60 }, // In minutes, default 1 hour
  createdAt: { type: Date, default: Date.now },
});

const ChallengeSchema = new mongoose.Schema({
  address: { type: String, required: true },
  challenge: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});
// Auto-remove expired challenges
ChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Challenge: mongoose.model('Challenge', ChallengeSchema),
};