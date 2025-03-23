// Modelo para las peticiones de usuarios (para cambios de foto, contraseña, etc.).

const mongoose = require("mongoose");

const peticionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  detalle: { type: String, required: true, trim: true },
  nuevaFoto: { type: String },
  nuevaContraseña: { type: String },
  contraseñaAnterior: { type: String },
  estado: { type: String, enum: ["pendiente", "aprobado", "rechazado"], default: "pendiente" },
  fechaCreacion: { type: Date, default: Date.now },
});

peticionSchema.index({ usuario: 1, estado: 1 });
module.exports = mongoose.model("Peticion", peticionSchema);