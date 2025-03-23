// Middleware para proteger rutas y validar el token JWT.

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

exports.protegerRuta = (rolesPermitidos = []) => async (req, res, next) => {
  try {
    // Extraer token del header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No hay token, acceso denegado" });
    }
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    req.user = user;
    // Si se especificaron roles, se verifica que el usuario tenga uno permitido
    if (rolesPermitidos.length && !rolesPermitidos.map(r => r.toLowerCase()).includes(req.user.rol.toLowerCase())) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

exports.validarAccesoTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    if (req.user.rol === "funcionario") {
      const esAsignado = ticket.asignadoA && ticket.asignadoA.toString() === req.user.id;
      const esCreador = ticket.creadoPor.toString() === req.user.id;
      if (!esAsignado && !esCreador) {
        return res.status(403).json({ message: "No tienes permiso para ver este ticket" });
      }
    }
    next();
  } catch (error) {
    console.error("Error al validar acceso al ticket:", error);
    res.status(500).json({ message: "Error al validar acceso al ticket" });
  }
};