// Auth controller block: handles login HTTP request/response mapping.
const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils/errors');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    email: req.validated.body.email,
    password: req.validated.body.password,
    tenant: req.tenant
  });

  res.status(200).json(result);
});

module.exports = {
  login
};
