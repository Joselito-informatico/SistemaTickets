import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./DetalleTicket.css";

const ADetalleTicket = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
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
      setMensajes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  };

  const enviarMensaje = async (e) => {
    if (ticket?.estado.toLowerCase() === "cerrado") {
      e.preventDefault();
      return;
    }
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
            <span className={`estado-ticket ${ticket.estado.replace(" ", "-").toLowerCase()}`}>
              {ticket.estado}
            </span>
            <p><strong>Categoría:</strong> {ticket.categoria}</p>
            <p><strong>Subcategoría:</strong> {ticket.subcategoria}</p>
            <p><strong>Asignado a:</strong> {ticket.asignadoA ? ticket.asignadoA.nombre : "No asignado"}</p>
            <p><strong>Creado por:</strong> {ticket.creadoPor?.nombre || "Desconocido"}</p>
            <p>
              <strong>Fecha de creación:</strong> {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          

          <hr />

          <div className="chat-container">
            {/* Mostrar descripción solo si existe */}
            {ticket.descripcion && (
              <div className="mensaje usuario">
                <p><strong>{ticket.creadoPor?.nombre} (*Usuario*):</strong> {ticket.descripcion}</p>
              </div>
            )}
            {mensajes.map((msg, index) => (
              <div key={index} className={`mensaje ${msg.usuario?.rol || "desconocido"}`}>
                <p><strong>{msg.usuario?.nombre || "Desconocido"} (*{msg.usuario?.rol || "N/A"}*):</strong> {msg.mensaje}</p>
              </div>
            ))}
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

export default ADetalleTicket;