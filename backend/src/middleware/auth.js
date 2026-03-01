// Auth middleware block: verifies Bearer token and attaches user claims.
const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

function authMiddleware(req, _res, next) {
  // Header parsing block: expects 'Authorization: Bearer <token>'.
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Missing or invalid authorization header', 401));
  }

  try {
    // JWT decode block: trusted claims are attached to req.user.
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email
    };
    return next();
  } catch (_error) {
    // Token failure block: handles invalid/expired token errors.
    return next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authMiddleware;
