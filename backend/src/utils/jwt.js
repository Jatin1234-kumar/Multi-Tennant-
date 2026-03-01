// JWT utility block: signs and verifies access tokens.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken
};
