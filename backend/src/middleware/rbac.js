// RBAC middleware block: checks if current user role is allowed for route.
const { AppError } = require('../utils/errors');

function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }

    return next();
  };
}

module.exports = {
  allowRoles
};
