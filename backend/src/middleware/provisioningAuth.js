// Provisioning auth block: protects tenant creation with platform-level key.
const env = require('../config/env');
const { AppError } = require('../utils/errors');

function provisioningAuth(req, _res, next) {
  const requestKey = req.headers['x-platform-key'];

  if (!env.platformProvisioningKey || requestKey !== env.platformProvisioningKey) {
    return next(new AppError('Forbidden', 403));
  }

  return next();
}

module.exports = provisioningAuth;
