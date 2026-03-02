// Project schema block: validation contracts for project endpoints.
const { z } = require('zod');
const env = require('../../config/env');

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
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(env.maxPageSize).default(env.defaultPageSize)
  })
});

const deleteProjectSchema = z.object({
  body: z.object({}),
  params: z.object({
    projectId: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

module.exports = {
  createProjectSchema,
  listProjectsSchema,
  deleteProjectSchema
};
