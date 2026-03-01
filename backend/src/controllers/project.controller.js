// Project controller block: maps project endpoints to service methods.
const projectService = require('../services/project.service');
const { asyncHandler } = require('../utils/errors');

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.tenant, req.user);
  res.status(200).json({ data: projects });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.tenant, req.user, req.validated.body);
  res.status(201).json({ data: project });
});

module.exports = {
  listProjects,
  createProject
};
