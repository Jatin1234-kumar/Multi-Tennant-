// Task controller block: maps task endpoints to service methods.
const taskService = require('../services/task.service');
const { asyncHandler } = require('../utils/errors');

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks(req.tenant, req.validated.query);
  res.status(200).json({ data: tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.tenant, req.validated.body);
  res.status(201).json({ data: task });
});

module.exports = {
  listTasks,
  createTask
};
