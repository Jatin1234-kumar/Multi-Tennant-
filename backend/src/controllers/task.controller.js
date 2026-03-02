// Task controller block: maps task endpoints to service methods.
const taskService = require('../services/task.service');
const { asyncHandler } = require('../utils/errors');

const listTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.tenant, req.validated.query);
  res.status(200).json({
    data: result.items,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / result.pageSize)
    }
  });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.tenant, req.validated.body);
  res.status(201).json({ data: task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.tenant,
    req.validated.params.taskId,
    req.validated.body.status
  );

  res.status(200).json({ data: task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const deleted = await taskService.deleteTask(req.tenant, req.validated.params.taskId);
  res.status(200).json({ data: deleted });
});

module.exports = {
  listTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};
