// Ruta para obtener respuestas predefinidas del chatbot según la categoría, subcategoría
// y la keyword (usualmente la descripción del ticket) para detectar coincidencias en las palabras clave.

const express = require("express");
const router = express.Router();
const ChatbotResponse = require("../models/ChatbotResponse");

// Función para normalizar textos: convierte a minúsculas, elimina acentos, caracteres especiales y espacios extra.
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[^a-z0-9\s]/g, "");     // elimina caracteres especiales
};

router.get("/", async (req, res, next) => {
  try {
    const { categoria, subcategoria, keyword } = req.query;

    if (!categoria || !subcategoria) {
      return res.status(400).json({ message: "Debe proporcionar 'categoria' y 'subcategoria'" });
    }

    // Buscar el documento correspondiente en la colección
    const chatbotData = await ChatbotResponse.findOne({ categoria, subcategoria });
    if (!chatbotData) {
      return res.status(404).json({ message: "No se encontraron respuestas para esta categoría y subcategoría." });
    }

    // Si se proporciona una keyword, se normaliza para comparar
    if (keyword) {
      const normalizedKeyword = normalizeText(keyword);
      // console.log("Normalized keyword:", normalizedKeyword); // Útil para depuración
      let matchedResponse = null;
      for (const key of chatbotData.keywords.keys()) {
        const normalizedKey = normalizeText(key);
        // console.log(`Comparando '${normalizedKeyword}' con clave '${normalizedKey}'`); // Para depuración
        if (normalizedKeyword.includes(normalizedKey)) {
          matchedResponse = chatbotData.keywords.get(key);
          break;
        }
      }
      if (matchedResponse) {
        return res.status(200).json({ respuestas: [{ respuesta: matchedResponse }] });
      }
    }

    // Si no se encontró coincidencia de keyword, devolver respuestas predefinidas secuenciales
    if (chatbotData.responses && chatbotData.responses.length > 0) {
      // Ordenar las respuestas por el campo "orden"
      const sortedResponses = chatbotData.responses.sort((a, b) => a.orden - b.orden);
      return res.status(200).json({ respuestas: sortedResponses });
    }

    // Si no hay respuestas en el arreglo, devolver la respuesta por defecto
    return res.status(200).json({ respuestas: [{ respuesta: chatbotData.defaultResponse }] });
  } catch (error) {
    console.error("Error en el chatbot:", error);
    next(error);
  }
});

module.exports = router;