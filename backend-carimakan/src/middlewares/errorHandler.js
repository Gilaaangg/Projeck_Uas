const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Sequelize validation error
  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: messages,
    });
  }

  // Sequelize unique constraint error
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikat)',
    });
  }

  // Sequelize database error
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada database',
    });
  }

  // JWT error (handled di middleware auth, tapi jaga-jaga)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    });
  }

  // Custom error with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
