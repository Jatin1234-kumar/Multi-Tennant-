// Onboarding routes block: public workspace registration endpoint.
const express = require('express');
const onboardingController = require('../controllers/onboarding.controller');
const validate = require('../middleware/validate');
const { registerWorkspaceSchema } = require('../models/schemas/onboarding.schema');

const router = express.Router();

router.post('/register-workspace', validate(registerWorkspaceSchema), onboardingController.registerWorkspace);

module.exports = router;
