// Error handler block: converts thrown errors into consistent API responses.
function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const isOperational = statusCode < 500;

  // Logging block: logs only server-side/non-operational failures.
  if (!isOperational) {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
}

module.exports = errorHandler;
