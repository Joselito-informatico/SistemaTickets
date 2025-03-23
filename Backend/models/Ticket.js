// Modelo para los tickets.

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  categoria: { type: String, required: true },
  subcategoria: { type: String, required: true },
  descripcion: { type: String, required: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  estado: { type: String, enum: ["abierto", "en proceso", "cerrado"], default: "abierto" },
  fechaCreacion: { type: Date, default: Date.now },
  mensajes: [
    {
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      mensaje: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);