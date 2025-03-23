// Modelo para los eventos.

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  descripcion: { type: String },
  creadoPor: { type: String, required: true }
});

module.exports = mongoose.model('Event', eventSchema);