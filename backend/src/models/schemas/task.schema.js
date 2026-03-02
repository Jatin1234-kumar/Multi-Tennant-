// Task schema block: validation contracts for task create/list endpoints.
const { z } = require('zod');
const env = require('../../config/env');

// Enum block: allowed task lifecycle statuses.
const taskStatusEnum = z.enum(['todo', 'in_progress', 'done']);

// Create schema block: validates body for task creation.
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150),
    status: taskStatusEnum.optional(),
    projectId: z.coerce.number().int().positive(),
    assignedTo: z.coerce.number().int().positive().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

// List schema block: validates optional query filters for listing tasks.
const listTasksSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    projectId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(env.maxPageSize).default(env.defaultPageSize)
  })
});

const updateTaskStatusSchema = z.object({
  body: z.object({
    status: taskStatusEnum
  }),
  params: z.object({
    taskId: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

const deleteTaskSchema = z.object({
  body: z.object({}),
  params: z.object({
    taskId: z.coerce.number().int().positive()
  }),
  query: z.object({})
});

module.exports = {
  createTaskSchema,
  listTasksSchema,
  updateTaskStatusSchema,
  deleteTaskSchema
};
