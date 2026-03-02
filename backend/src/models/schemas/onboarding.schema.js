// Onboarding schema block: request validation for tenant self-registration.
const { z } = require('zod');

const registerWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    subdomain: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  registerWorkspaceSchema
};
