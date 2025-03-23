// Controlador para las operaciones de autenticación (login y logout).

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Validación básica de entrada
  if (!email || !password) {
    return res.status(400).json({ message: "El correo y la contraseña son obligatorios" });
  }
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
    const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
    // Actualizamos el estado a "online"
    usuario.isOnline = true;
    await usuario.save();
    // Generamos el token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({
      token,
      usuario: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error });
  }
};

exports.logout = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (usuario) {
      usuario.isOnline = false;
      await usuario.save();
      // Emitir evento de desconexión si se usa Socket.io
      req.app.get("io")?.emit("userDisconnected", req.user.id);
    }
    res.json({ message: "Usuario desconectado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error });
  }
};