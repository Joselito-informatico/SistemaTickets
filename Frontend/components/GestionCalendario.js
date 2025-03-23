// Componente para gestionar la creación y eliminación de eventos.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './GestionCalendario.css';

const GestionCalendario = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    descripcion: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const addEvent = async () => {
    if (!newEvent.titulo || !newEvent.fecha || !newEvent.hora || !newEvent.descripcion) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    try {
      const eventData = {
        titulo: newEvent.titulo,
        fecha: newEvent.fecha,
        hora: newEvent.hora,
        descripcion: newEvent.descripcion,
        creadoPor: localStorage.getItem('email'),
      };
      const response = await axios.post('http://localhost:5000/api/events', eventData);
      setEvents([...events, response.data]);
      toast.success('Evento agregado correctamente');
      setNewEvent({ titulo: '', fecha: '', hora: '', descripcion: '' });
    } catch (error) {
      console.error('Error al agregar evento:', error);
      toast.error('No se pudo agregar el evento');
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}`);
        setEvents(events.filter((event) => event._id !== id));
        toast.success('Evento eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        toast.error('No se pudo eliminar el evento');
      }
    }
  };

  return (
    <div className="gestion-calendario">
      <h2>Gestión de Calendario</h2>
      <div className="form-evento">
        <input
          type="text"
          name="titulo"
          placeholder="Título del evento"
          value={newEvent.titulo}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="fecha"
          value={newEvent.fecha}
          onChange={handleInputChange}
        />
        <input
          type="time"
          name="hora"
          value={newEvent.hora}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={newEvent.descripcion}
          onChange={handleInputChange}
        />
        <button onClick={addEvent} className="btn-agregar">
          Agregar Evento
        </button>
      </div>
      <div className="lista-eventos">
        <h3>Próximos Eventos</h3>
        <ul>
          {events.length === 0 ? (
            <li>No hay eventos programados</li>
          ) : (
            events.map((event) => (
              <li key={event._id} className="evento-item">
                <span>
                  {event.fecha} {event.hora} - {event.titulo}: {event.descripcion}
                </span>
                <button onClick={() => deleteEvent(event._id)} className="btn-eliminar">
                  🗑️
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default GestionCalendario;