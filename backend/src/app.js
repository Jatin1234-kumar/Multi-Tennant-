// App wiring block: imports all middleware and route modules.
const express = require('express');
const securityMiddleware = require('./middleware/security');
const tenantResolver = require('./middleware/tenantResolver');
const authMiddleware = require('./middleware/auth');
const tenantAccessMiddleware = require('./middleware/tenantAccess');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const tenantRoutes = require('./routes/tenant.routes');

// Express app creation block.
const app = express();

// Global middleware block: security and JSON parsing.
app.use(securityMiddleware);
app.use(express.json({ limit: '1mb' }));

// Health endpoint block: infra and uptime checks.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Public/system route block: tenant provisioning.
app.use('/api/v1/system/tenants', tenantRoutes);

// Tenant-aware auth route block: login requires tenant context from subdomain.
app.use('/api/v1/auth', tenantResolver, authRoutes);

// Protected project/task route block: resolve tenant -> verify token -> enforce tenant match.
app.use('/api/v1/projects', tenantResolver, authMiddleware, tenantAccessMiddleware, projectRoutes);
app.use('/api/v1/tasks', tenantResolver, authMiddleware, tenantAccessMiddleware, taskRoutes);

// Centralized error handling block.
app.use(errorHandler);

module.exports = app;
