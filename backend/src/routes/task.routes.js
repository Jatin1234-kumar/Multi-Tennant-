// Task routes block: tenant-authenticated task operations.
const express = require('express');
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const { allowRoles } = require('../middleware/rbac');
const {
	createTaskSchema,
	listTasksSchema,
	updateTaskStatusSchema,
	deleteTaskSchema
} = require('../models/schemas/task.schema');

const router = express.Router();

// Read route block: Admin and Member can list tasks.
router.get('/', allowRoles('Admin', 'Member'), validate(listTasksSchema), taskController.listTasks);
// Create route block: Admin and Member can create tasks.
router.post('/', allowRoles('Admin', 'Member'), validate(createTaskSchema), taskController.createTask);
router.patch('/:taskId/status', allowRoles('Admin', 'Member'), validate(updateTaskStatusSchema), taskController.updateTaskStatus);
router.delete('/:taskId', allowRoles('Admin', 'Member'), validate(deleteTaskSchema), taskController.deleteTask);

module.exports = router;
