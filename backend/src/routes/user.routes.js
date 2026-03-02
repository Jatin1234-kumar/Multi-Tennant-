// User routes block: tenant-authenticated team management endpoints.
const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { allowRoles } = require('../middleware/rbac');
const { listUsersSchema, createUserSchema } = require('../models/schemas/user.schema');

const router = express.Router();

router.get('/', allowRoles('Admin', 'Member'), validate(listUsersSchema), userController.listUsers);
router.post('/', allowRoles('Admin'), validate(createUserSchema), userController.createUser);

module.exports = router;
