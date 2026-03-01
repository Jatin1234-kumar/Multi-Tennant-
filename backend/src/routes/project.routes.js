// Project routes block: tenant-authenticated project operations.
const express = require('express');
const projectController = require('../controllers/project.controller');
const validate = require('../middleware/validate');
const { allowRoles } = require('../middleware/rbac');
const { createProjectSchema, listProjectsSchema } = require('../models/schemas/project.schema');

const router = express.Router();

// Read route block: both Admin and Member can list projects.
router.get('/', allowRoles('Admin', 'Member'), validate(listProjectsSchema), projectController.listProjects);
// Create route block: only Admin can create projects.
router.post('/', allowRoles('Admin'), validate(createProjectSchema), projectController.createProject);

module.exports = router;
