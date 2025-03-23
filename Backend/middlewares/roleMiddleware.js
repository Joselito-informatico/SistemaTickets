// Middleware para validar que el usuario tenga uno de los roles permitidos.

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: "Acceso denegado. Privilegios insuficientes." });
    }
    next();
  };
};

module.exports = requireRole;