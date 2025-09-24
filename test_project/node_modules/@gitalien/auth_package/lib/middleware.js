const jwt = require('jsonwebtoken');

function authenticateJWT(jwtSecret) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token', details: err.message });
    }
  };
}

module.exports = { authenticateJWT };