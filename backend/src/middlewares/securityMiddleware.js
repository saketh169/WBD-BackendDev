const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const helmetMiddleware = helmet();

const rateLimiter = rateLimit({
  windowMs: 10000,
  max: 100000,
  message: 'Too many requests from this IP, please try again after 10 seconds',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.path === '/api/health') return true;
    return false;
  },
});

const authRateLimiter = rateLimit({
  windowMs: 10000,
  max: 100000,
  message: 'Too many login attempts, please try again after 10 seconds',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const sanitizeInput = (req, res, next) => {
  const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
  };

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = cleanString(req.query[key]);
      }
    });
  }

  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = cleanString(req.body[key]);
      }
    });
  }

  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = cleanString(req.params[key]);
      }
    });
  }

  next();
};

const corsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

module.exports = {
  helmetMiddleware,
  rateLimiter,
  authRateLimiter,
  sanitizeInput,
  corsHeaders,
};
