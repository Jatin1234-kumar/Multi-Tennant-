// Security middleware block: headers, CORS policy, and global rate limiting.
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Middleware chain block: exported as an array and mounted at app level.
const securityMiddleware = [
  helmet(),
  cors({
    origin: env.corsAllowedOrigins === '*' ? true : env.corsAllowedOrigins.split(',').map((item) => item.trim())
  }),
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false
  })
];

module.exports = securityMiddleware;
