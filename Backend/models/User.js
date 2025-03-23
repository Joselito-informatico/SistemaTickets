// Modelo para los usuarios.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  rol: { type: String, enum: ["admin", "funcionario", "usuario"], required: true },
  isOnline: { type: Boolean, default: false },
  fotoPerfil: { type: String },
  cedula: String,
  nacionalidad: String,
  sexo: String,
  fechaNacimiento: String,
  direccion: String,
  telefono: String,
  fechaRegistro: { type: Date, default: Date.now },
  esChatbot: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);