// Project schema block: validation contracts for project endpoints.
const { z } = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    description: z.string().max(500).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

const listProjectsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({})
});

module.exports = {
  createProjectSchema,
  listProjectsSchema
};
