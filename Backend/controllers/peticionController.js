// Controlador para gestionar peticiones (consultas, cambios de foto, contraseña, etc.).

const Peticion = require('../models/Peticion');
const User = require('../models/User');
const bcrypt = require("bcrypt");

exports.getAllPeticiones = async (req, res) => {
  try {
    const peticiones = await Peticion.find().populate("usuario", "nombre fotoPerfil email");
    if (!peticiones || peticiones.length === 0) {
      return res.status(404).json({ message: "No hay peticiones registradas" });
    }
    res.json(peticiones);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.createPeticion = async (req, res, next) => {
  try {
    const { usuario, detalle, nuevaFoto } = req.body;
    if (!usuario || !detalle || !nuevaFoto) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const nuevaPeticion = new Peticion({ usuario, detalle, nuevaFoto });
    await nuevaPeticion.save();
    res.status(201).json(nuevaPeticion);
  } catch (error) {
    next(error);
  }
};

exports.approvePeticion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const peticion = await Peticion.findById(id).populate("usuario", "rol fotoPerfil nombre email passwordHash");
    if (!peticion) {
      return res.status(404).json({ message: 'Petición no encontrada' });
    }
    // Solo el admin puede gestionar peticiones de funcionarios en ciertos casos
    if (peticion.detalle === "Resetear contraseña" && peticion.usuario.rol === "funcionario" && req.user.rol === "funcionario") {
      return res.status(403).json({ message: "Solo el admin puede gestionar peticiones de funcionarios" });
    }
    // Si se solicita cambiar la contraseña, actualizarla (hash)
    if (peticion.nuevaContraseña) {
      const hashedPassword = await bcrypt.hash(peticion.nuevaContraseña, 10);
      await User.findByIdAndUpdate(peticion.usuario._id, { passwordHash: hashedPassword });
    } else if (peticion.nuevaFoto) {
      // Actualizar foto de perfil
      await User.findByIdAndUpdate(peticion.usuario._id, { fotoPerfil: peticion.nuevaFoto });
    }
    peticion.estado = 'aprobado';
    await peticion.save();
    res.status(200).json({ message: 'Petición aprobada y actualización realizada' });
  } catch (error) {
    next(error);
  }
};

exports.rejectPeticion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const peticion = await Peticion.findById(id).populate("usuario", "rol");
    if (!peticion) {
      return res.status(404).json({ message: 'Petición no encontrada' });
    }
    // Solo el admin puede gestionar peticiones de funcionarios
    if (peticion.usuario.rol === "funcionario" && req.user.rol === "funcionario") {
      return res.status(403).json({ message: "Solo el admin puede gestionar peticiones de funcionarios" });
    }
    peticion.estado = 'rechazado';
    await peticion.save();
    res.status(200).json({ message: 'Petición rechazada' });
  } catch (error) {
    next(error);
  }
};