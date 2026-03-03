// Invite schema block: validation contracts for invite creation/list/accept endpoints.
const { z } = require('zod');
const env = require('../../config/env');

const listInvitesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(env.maxPageSize).default(env.defaultPageSize)
  })
});

const createInviteSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(['Admin', 'Member']).default('Member')
  }),
  params: z.object({}),
  query: z.object({})
});

const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  listInvitesSchema,
  createInviteSchema,
  acceptInviteSchema
};
