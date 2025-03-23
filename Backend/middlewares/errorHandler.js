// Middleware para centralizar el manejo de errores.

const logger = require('../logger'); // Se asume que logger está configurado

const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Error interno del servidor",
  });
};

module.exports = errorHandler;