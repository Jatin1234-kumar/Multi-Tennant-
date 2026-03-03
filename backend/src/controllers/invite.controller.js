// Invite controller block: invite create/list/accept endpoint mapping.
const inviteService = require('../services/invite.service');
const { asyncHandler } = require('../utils/errors');

const listInvites = asyncHandler(async (req, res) => {
  const result = await inviteService.listInvites(req.tenant, req.validated.query);
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

const createInvite = asyncHandler(async (req, res) => {
  const result = await inviteService.createInvite(req.tenant, req.user, req.validated.body);
  res.status(201).json(result);
});

const acceptInvite = asyncHandler(async (req, res) => {
  const result = await inviteService.acceptInvite(req.validated.body);
  res.status(200).json(result);
});

module.exports = {
  listInvites,
  createInvite,
  acceptInvite
};
