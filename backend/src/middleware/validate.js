// Validation middleware block: parses request against a Zod schema.
const { AppError } = require('../utils/errors');

function validate(schema) {
  return (req, _res, next) => {
    // Parse block: validates body, params, and query in one place.
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    // Failure block: returns first validation error message.
    if (!result.success) {
      return next(new AppError(result.error.issues[0]?.message || 'Validation failed', 400));
    }

    // Success block: stores sanitized payload for downstream handlers.
    req.validated = result.data;
    return next();
  };
}

module.exports = validate;
