// User schema block: validation contracts for team management endpoints.
const { z } = require('zod');
const env = require('../../config/env');

const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(env.maxPageSize).default(env.defaultPageSize)
  })
});

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['Admin', 'Member']).default('Member')
  }),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  listUsersSchema,
  createUserSchema
};
