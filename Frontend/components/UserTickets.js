// Componente para que el usuario vea sus tickets con filtros, ordenación y paginación.

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Tickets.css";
import { AuthContext } from "../context/AuthContext";

const UserTickets = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("titulo");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      // Si el usuario es admin, se redirige
      if (auth?.role === "admin") {
        navigate("/tickets");
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/tickets/mis-tickets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    }
  };

  // Filtrado por título, categoría o estado (en minúsculas para comparar)
  const filteredTickets = tickets.filter((ticket) =>
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
  const totalPages = Math.ceil(sortedTickets.length / ticketsPerPage);
  const currentTickets = sortedTickets.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  );

  return (
    <div className="tickets-container">
      <h1>Mis Tickets</h1>
      
      <div className="filter-sort-container">
        <input 
          type="text" 
          placeholder="Filtrar por título, categoría o estado..." 
          value={filterText} 
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1); // Reinicia la página al cambiar el filtro
          }}
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
          </tr>
        </thead>
        <tbody>
          {currentTickets.map((ticket) => (
            <tr
              key={ticket._id}
              onClick={() => navigate(`/udetalleticket/${ticket._id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{ticket._id}</td>
              <td>{ticket.titulo}</td>
              <td>{ticket.categoria}</td>
              <td>
                <span
                  className={`estado-ticket ${
                    ticket.estado.toLowerCase() === "abierto" ? "estado-abierto" : "estado-cerrado"
                  }`}
                >
                  {ticket.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default UserTickets;