// Controlador para gestionar usuarios: obtener, crear, actualizar, resetear contraseña y perfil.

const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.rol = role;
    }
    const users = await User.find(query).select("-passwordHash");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

exports.createUser = async (req, res, next) => {
  const { nombre, email, passwordHash, rol, fotoPerfil, cedula, nacionalidad, sexo, fechaNacimiento, direccion, telefono } = req.body;
  if (!nombre || !email || !passwordHash || !rol) {
    return res.status(400).json({ message: "Todos los campos obligatorios deben completarse" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está en uso" });
    }
    const hashedPassword = await bcrypt.hash(passwordHash, 10);
    const newUser = new User({
      nombre,
      email,
      passwordHash: hashedPassword,
      rol,
      fotoPerfil: fotoPerfil || "",
      cedula: cedula || "",
      nacionalidad: nacionalidad || "",
      sexo: sexo || "",
      fechaNacimiento: fechaNacimiento || "",
      direccion: direccion || "",
      telefono: telefono || "",
    });
    await newUser.save();
    res.status(201).json({ message: "Usuario creado correctamente", user: newUser });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Usuario no autenticado" });
    }
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error en getUserProfile:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { fotoPerfil } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fotoPerfil },
      { new: true }
    ).select("-passwordHash");
    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, nuevaContraseña } = req.body;
  if (!email || !nuevaContraseña) {
    return res.status(400).json({ message: "Email y nueva contraseña son obligatorios" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (user.rol === "admin") {
      // Nota: Se recomienda también hashear la contraseña para admin
      user.passwordHash = nuevaContraseña;
      await user.save();
      return res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } else {
      const Peticion = require("../models/Peticion");
      const nuevaPeticion = new Peticion({
        usuario: user._id,
        detalle: "Resetear contraseña",
        contraseñaAnterior: user.passwordHash,
        nuevaContraseña,
      });
      await nuevaPeticion.save();
      return res.status(201).json({ message: "Solicitud de restablecimiento de contraseña enviada para aprobación" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getFuncionarioAleatorio = async (req, res, next) => {
  try {
    const funcionario = await User.aggregate([
      { $match: { rol: "funcionario" } },
      { $sample: { size: 1 } }
    ]);
    if (!funcionario.length) {
      return res.status(404).json({ message: "No se encontró ningún funcionario" });
    }
    res.status(200).json(funcionario[0]);
  } catch (error) {
    next(error);
  }
};