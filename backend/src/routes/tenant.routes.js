// Tenant routes block: platform-only tenant provisioning endpoint.
const express = require('express');
const tenantController = require('../controllers/tenant.controller');
const validate = require('../middleware/validate');
const provisioningAuth = require('../middleware/provisioningAuth');
const { createTenantSchema } = require('../models/schemas/tenant.schema');

const router = express.Router();

// Provision route block: platform key auth + payload validation + tenant bootstrap.
router.post('/', provisioningAuth, validate(createTenantSchema), tenantController.createTenant);

module.exports = router;
