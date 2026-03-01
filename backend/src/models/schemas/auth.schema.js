// Auth schema block: request contract for login endpoint.
const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  loginSchema
};
