const express = require('express');
const { setupAuthRoutes, authenticateJWT } = require('./lib/auth');
const { User, Challenge } = require('./lib/schemas');

/**
 * Initialize the SWEC Auth module
 * @param {Object} config - Configuration object
 * @param {string} config.mongoUri - MongoDB connection URI
 * @param {string} config.jwtSecret - JWT secret for token signing
 * @param {string[]} [config.corsOrigins] - Allowed CORS origins
 * @param {Object} [config.rateLimit] - Rate limit configuration
 * @param {string} [config.domain] - SIWE domain (default: http://localhost:5173)
 * @param {string} [config.uri] - SIWE URI (default: http://localhost:5173)
 * @param {number} [config.chainId] - SIWE chain ID (default: 1)
 * @param {string} [config.infuraKey] - Optional Infura API key for ENS resolution
 * @returns {express.Router} - Express router with auth routes
 */
function initializeSwecAuth(config = {}) {
  if (!config.mongoUri) throw new Error('MongoDB URI is required');
  if (!config.jwtSecret) throw new Error('JWT secret is required');

  const router = express.Router();
  setupAuthRoutes(router, config);
  return router;
}

module.exports = {
  initializeSwecAuth,
  authenticateJWT,
  User,
  Challenge,
};