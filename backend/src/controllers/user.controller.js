// User controller block: maps team endpoints to service methods.
const userService = require('../services/user.service');
const { asyncHandler } = require('../utils/errors');

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.tenant, req.validated.query);
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

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.tenant, req.validated.body);
  res.status(201).json({ data: user });
});

module.exports = {
  listUsers,
  createUser
};
