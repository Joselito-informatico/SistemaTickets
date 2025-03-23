import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = ({ categoria, subcategoria, keyword, onMessage }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchChatbotResponse();
  }, [categoria, subcategoria, keyword]);

  const fetchChatbotResponse = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/chatbot`, {
        params: { categoria, subcategoria, keyword },
      });
      const respuestas = response.data.respuestas;
      let botMessage = {
        usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
        mensaje: "No se encontró una respuesta automática.",
      };

      if (Array.isArray(respuestas) && respuestas.length > 0) {
        botMessage.mensaje = respuestas[0].respuesta;
      }

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      onMessage(botMessage.mensaje);
    } catch (error) {
      console.error("Error obteniendo la respuesta del chatbot:", error);
      const errorMessage = {
        usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
        mensaje: "Error en el asistente virtual, intenta más tarde.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      onMessage(errorMessage.mensaje);
    }
  };

  return null;
};

export default ChatBot;