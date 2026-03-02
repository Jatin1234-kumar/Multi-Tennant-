// Onboarding controller block: handles workspace registration requests.
const onboardingService = require('../services/onboarding.service');
const { asyncHandler } = require('../utils/errors');

const registerWorkspace = asyncHandler(async (req, res) => {
  const result = await onboardingService.registerWorkspace(req.validated.body);
  res.status(201).json(result);
});

module.exports = {
  registerWorkspace
};
