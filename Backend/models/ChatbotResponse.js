// Modelo para las respuestas predefinidas del chatbot.

const mongoose = require("mongoose");

const chatbotResponseSchema = new mongoose.Schema(
  {
    categoria: { type: String, required: true },
    subcategoria: { type: String, required: true },
    // Un Map para almacenar palabras clave y sus respuestas
    keywords: { type: Map, of: String },
    // Respuesta por defecto si no hay coincidencias
    defaultResponse: { type: String, required: true },
    // Array de respuestas ordenadas (pueden ser secuenciales o alternativas)
    responses: [
      {
        orden: { type: Number, required: true },
        respuesta: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatbotResponse", chatbotResponseSchema);