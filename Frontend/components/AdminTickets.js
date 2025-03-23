import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";
import "./Tickets.css";
import { AuthContext } from "../context/AuthContext";

// Configurar el elemento de la app para el modal
Modal.setAppElement("#root");

// Estilos personalizados para centrar el modal
const customModalStyles = {
  overlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    position: "relative",
    inset: "unset",
    width: "400px",
    maxWidth: "90%",
    height: "auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
};

const AdminTickets = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [usuarioAsignado, setUsuarioAsignado] = useState("");
  
  // Estados para filtros, ordenación y paginación
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("titulo");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    fetchTickets();
    fetchFuncionarios();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      toast.error("Error al obtener tickets");
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users?role=funcionario`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFuncionarios(response.data);
    } catch (error) {
      console.error("Error al obtener funcionarios:", error);
      toast.error("Error al obtener funcionarios");
    }
  };

  // Filtrar tickets por título, categoría o estado
  const filteredTickets = tickets.filter(ticket =>
    ticket.titulo.toLowerCase().includes(filterText.toLowerCase()) ||
    ticket.categoria.toLowerCase().includes(filterText.toLowerCase()) ||
    ticket.estado.toLowerCase().includes(filterText.toLowerCase())
  );

  // Ordenar tickets según el campo seleccionado
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const fieldA = a[sortBy]?.toLowerCase();
    const fieldB = b[sortBy]?.toLowerCase();
    if (fieldA < fieldB) return -1;
    if (fieldA > fieldB) return 1;
    return 0;
  });

  // Paginación
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(sortedTickets.length / ticketsPerPage);

  const handleOpenModal = (ticket, e) => {
    e.stopPropagation();
    setTicketSeleccionado(ticket);
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setTicketSeleccionado(null);
    setUsuarioAsignado("");
  };

  const handleAssignTicket = async () => {
    if (!usuarioAsignado) {
      toast.error("Debe seleccionar un funcionario");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/tickets/${ticketSeleccionado._id}/asignar`, 
        { usuarioAsignado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ticket asignado correctamente");
      fetchTickets();
      handleCloseModal();
    } catch (error) {
      console.error("Error al asignar ticket:", error);
      toast.error("Error al asignar el ticket");
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/cerrar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ticket cerrado correctamente");
      fetchTickets();
    } catch (error) {
      toast.error("Error al cerrar el ticket");
      console.error(error);
    }
  };

  const handleReopenTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_URL}/tickets/${ticketId}/reabrir`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Ticket reabierto correctamente");
      fetchTickets();
    } catch (error) {
      toast.error("Error al reabrir el ticket");
      console.error(error);
    }
  };

  return (
    <div className="tickets-container">
      <h1>Gestión de Tickets (Admin)</h1>
      
      <div className="filter-sort-container">
        <input 
          type="text" 
          placeholder="Filtrar por título, categoría o estado..." 
          value={filterText} 
          onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
          className="filter-input"
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="titulo">Ordenar por Título</option>
          <option value="categoria">Ordenar por Categoría</option>
          <option value="estado">Ordenar por Estado</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Asignado A</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.map((ticket) => (
            <tr 
              key={ticket._id} 
              onClick={() => navigate(`/adetalleticket/${ticket._id}`)} 
              style={{ cursor: "pointer" }}
            >
              <td>{ticket._id}</td>
              <td>{ticket.titulo}</td>
              <td>{ticket.categoria}</td>
              <td>
                <span className={`estado-ticket ${ticket.estado.toLowerCase() === "abierto" ? "estado-abierto" : "estado-cerrado"}`}>
                  {ticket.estado}
                </span>
              </td>
              <td>{ticket.asignadoA ? ticket.asignadoA.nombre : "No asignado"}</td>
              <td className="action-buttons">
                <button onClick={(e) => handleOpenModal(ticket, e)} className="assign">Asignar</button>
                {ticket.estado.toLowerCase() === "abierto" && (
                  <button onClick={(e) => { e.stopPropagation(); handleCloseTicket(ticket._id); }} className="close">Cerrar</button>
                )}
                {ticket.estado.toLowerCase() === "cerrado" && (
                  <button onClick={(e) => { e.stopPropagation(); handleReopenTicket(ticket._id); }} className="reopen">Reabrir</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      <Modal isOpen={modalAbierto} onRequestClose={handleCloseModal} style={customModalStyles} shouldCloseOnOverlayClick={true} shouldCloseOnEsc={true}>
        <div className="modal-content custom-modal">
          <h2>Asignar Ticket</h2>
          <select 
            value={usuarioAsignado} 
            onChange={(e) => setUsuarioAsignado(e.target.value)}
            className="modal-select"
          >
            <option value="">Seleccione un funcionario</option>
            {funcionarios.map((funcionario) => (
              <option key={funcionario._id} value={funcionario._id}>{funcionario.nombre}</option>
            ))}
          </select>
          <div className="modal-buttons">
            <button onClick={handleAssignTicket} className="assign">Asignar</button>
            <button onClick={handleCloseModal} className="cancel">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTickets;