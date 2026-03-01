// Tenant schema block: validation contract for provisioning a new tenant.
const { z } = require('zod');

const createTenantSchema = z.object({
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
  createTenantSchema
};
