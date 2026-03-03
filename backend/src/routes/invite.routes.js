// Invite routes block: admin invite management and public invite acceptance.
const express = require('express');
const inviteController = require('../controllers/invite.controller');
const validate = require('../middleware/validate');
const tenantResolver = require('../middleware/tenantResolver');
const authMiddleware = require('../middleware/auth');
const tenantAccessMiddleware = require('../middleware/tenantAccess');
const { allowRoles } = require('../middleware/rbac');
const {
  listInvitesSchema,
  createInviteSchema,
  acceptInviteSchema
} = require('../models/schemas/invite.schema');

const router = express.Router();

router.post('/accept', validate(acceptInviteSchema), inviteController.acceptInvite);

router.use(tenantResolver, authMiddleware, tenantAccessMiddleware);
router.get('/', allowRoles('Admin', 'Member'), validate(listInvitesSchema), inviteController.listInvites);
router.post('/', allowRoles('Admin'), validate(createInviteSchema), inviteController.createInvite);

module.exports = router;
