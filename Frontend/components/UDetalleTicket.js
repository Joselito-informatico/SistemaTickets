import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./DetalleTicket.css";

const UDetalleTicket = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensajesChatbot, setMensajesChatbot] = useState([]); // Mensajes del chatbot (no desaparecen)
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mostrarChatbot, setMostrarChatbot] = useState(false);
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTicket();
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(response.data);
    } catch (error) {
      console.error("Error al obtener el ticket:", error);
    }
  };

  const fetchMensajes = async () => {
    try {
      const response = await api.get(`/tickets/${id}/mensajes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Solo se muestran los mensajes que no son del chatbot
      setMensajes(response.data.filter(msg => msg.usuario.rol !== "chatbot"));
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  };

  const llamarChatbot = async () => {
    if (!ticket) return;

    setMensajesChatbot(prev => [
      ...prev,
      {
        usuario: { nombre: "Usuario", rol: "usuario" },
        mensaje: "Llamando al asistente virtual..."
      }
    ]);

    try {
      const response = await api.get("/chatbot", {
        params: { categoria: ticket.categoria, subcategoria: ticket.subcategoria }
      });
      const respuestasChatbot = response.data.respuestas || [];
      manejarConversacion(respuestasChatbot);
    } catch (error) {
      console.error("Error obteniendo la respuesta del chatbot:", error);
      setMensajesChatbot(prev => [
        ...prev,
        {
          usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
          mensaje: "Error en el asistente virtual, intenta más tarde."
        }
      ]);
    }
  };

  const manejarConversacion = async (respuestasChatbot) => {
    if (respuestasChatbot.length === 0) {
      setMensajesChatbot(prev => [
        ...prev,
        {
          usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
          mensaje: "No tengo más soluciones, se asignará a un funcionario."
        }
      ]);
      setEsperandoConfirmacion(true);
      return;
    }
    for (const respuesta of respuestasChatbot) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMensajesChatbot(prev => [
        ...prev,
        {
          usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
          mensaje: respuesta.respuesta
        }
      ]);
    }
    setEsperandoConfirmacion(true);
  };

  const confirmarSolucion = async (resuelto) => {
    if (resuelto) {
      cerrarTicket();
      setMensajesChatbot([]); // Limpiar los mensajes del chatbot si se confirma la solución
    } else {
      setMensajesChatbot(prev => [
        ...prev,
        {
          usuario: { nombre: "Asistente Virtual", rol: "chatbot" },
          mensaje: "Se asignará a un funcionario para revisar el caso."
        }
      ]);
    }
    setEsperandoConfirmacion(false);
  };

  const cerrarTicket = async () => {
    try {
      await api.put(
        `/tickets/${id}/estado`,
        { estado: "cerrado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ El asistente virtual ha cerrado el ticket.");
      fetchTicket();
    } catch (error) {
      console.error("Error al cerrar el ticket:", error);
      toast.error("❌ No se pudo cerrar el ticket.");
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      await api.post(
        `/tickets/${id}/mensajes`,
        { mensaje: nuevoMensaje },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNuevoMensaje("");
      fetchMensajes();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="detalle-ticket-container">
      {ticket ? (
        <>
          <h1>{ticket.titulo}</h1>
          <div className="ticket-info">
            <p><strong>Categoría:</strong> {ticket.categoria}</p>
            <p><strong>Subcategoría:</strong> {ticket.subcategoria}</p>
            <p>
              <strong>Asignado a:</strong>{" "}
              {ticket.asignadoA ? ticket.asignadoA.nombre : "No asignado"}
            </p>
            <p>
              <strong>Creado por:</strong>{" "}
              {ticket.creadoPor?.nombre || "Desconocido"}
            </p>
            <p>
              <strong>Fecha de creación:</strong>{" "}
              {new Date(ticket.fechaCreacion).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>

          {!esperandoConfirmacion && (
            <button className="btn-asistente-virtual" onClick={llamarChatbot}>
              {mostrarChatbot ? "Ocultar Asistente Virtual" : "Llamar Asistente Virtual"}
            </button>
          )}

          <hr />

          <div className="chat-container">
            {/* Mostrar la descripción del ticket como el primer mensaje, si existe */}
            {ticket.descripcion && (
              <div className="mensaje usuario">
                <p>
                  <strong>{ticket.creadoPor?.nombre || "Desconocido"} (*Usuario*):</strong>{" "}
                  {ticket.descripcion}
                </p>
              </div>
            )}

            {/* Mensajes enviados (excluyendo el chatbot) */}
            {mensajes.map((msg, index) => (
              <div key={index} className={`mensaje ${msg.usuario?.rol || "desconocido"}`}>
                <p>
                  <strong>{msg.usuario?.nombre || "Desconocido"} (*{msg.usuario?.rol || "N/A"}*):</strong>{" "}
                  {msg.mensaje}
                </p>
              </div>
            ))}

            {/* Mensajes del chatbot */}
            {mensajesChatbot.map((msg, index) => (
              <div key={`chatbot-${index}`} className="mensaje chatbot">
                <p>
                  <strong>{msg.usuario?.nombre} (*{msg.usuario?.rol}*):</strong>{" "}
                  {msg.mensaje}
                </p>
              </div>
            ))}

            {/* Integrar la confirmación como un bubble en el chat */}
            {esperandoConfirmacion && (
              <div className="mensaje confirmacion">
                <p>¿El asistente virtual resolvió tu problema?</p>
                <div className="confirmacion-buttons">
                  <button onClick={() => confirmarSolucion(true)}>✅ Sí, problema resuelto</button>
                  <button onClick={() => confirmarSolucion(false)}>❌ No, necesito ayuda</button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={enviarMensaje} className="chat-input">
            <textarea
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={ticket && ticket.estado.toLowerCase() === "cerrado"}
            />
            <button type="submit" disabled={ticket && ticket.estado.toLowerCase() === "cerrado"}>
              Enviar
            </button>
          </form>
        </>
      ) : (
        <p>Cargando ticket...</p>
      )}
    </div>
  );
};

export default UDetalleTicket;