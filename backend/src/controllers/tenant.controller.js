// Tenant controller block: exposes tenant provisioning endpoint.
const tenantService = require('../services/tenant.service');
const { asyncHandler } = require('../utils/errors');

const createTenant = asyncHandler(async (req, res) => {
  const result = await tenantService.createTenant(req.validated.body);
  res.status(201).json({ data: result });
});

module.exports = {
  createTenant
};
