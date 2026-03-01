// Password utility block: bcrypt hash and compare wrappers.
const bcrypt = require('bcrypt');
const env = require('../config/env');

function hashPassword(plainTextPassword) {
  return bcrypt.hash(plainTextPassword, env.bcryptRounds);
}

function comparePassword(plainTextPassword, hash) {
  return bcrypt.compare(plainTextPassword, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
