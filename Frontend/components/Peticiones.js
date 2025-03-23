// Componente para la gestión de peticiones, con filtro, paginación y un modal armonioso para ver el detalle.
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Peticiones.css";

const Peticiones = () => {
  const [peticiones, setPeticiones] = useState([]);
  const [selectedPeticion, setSelectedPeticion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Estados para filtro y paginación
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPeticiones();
  }, [token]);

  const fetchPeticiones = async () => {
    setLoading(true);
    try {
      const response = await api.get("/peticiones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeticiones(response.data);
    } catch (error) {
      console.error("Error al obtener peticiones:", error);
      toast.error("Error al obtener peticiones");
    } finally {
      setLoading(false);
    }
  };

  // Filtro: por detalle y/o usuario (nombre)
  const filteredPeticiones = peticiones.filter((p) =>
    (p.detalle && p.detalle.toLowerCase().includes(filterText.toLowerCase())) ||
    (p.usuario && p.usuario.nombre && p.usuario.nombre.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Paginación
  const totalPages = Math.ceil(filteredPeticiones.length / itemsPerPage);
  const currentPeticiones = filteredPeticiones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleManage = (peticion) => {
    setSelectedPeticion(peticion);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedPeticion) return;
    try {
      await api.put(`/peticiones/${selectedPeticion._id}/aprobar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Petición aprobada y actualización realizada.");
      fetchPeticiones();
      setShowModal(false);
    } catch (error) {
      toast.error("Error al aprobar la petición.");
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!selectedPeticion) return;
    try {
      await api.put(`/peticiones/${selectedPeticion._id}/rechazar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Petición rechazada.");
      fetchPeticiones();
      setShowModal(false);
    } catch (error) {
      toast.error("Error al rechazar la petición.");
      console.error(error);
    }
  };

  return (
    <div className="peticiones-container">
      <h1>Gestión de Peticiones</h1>
      <div className="filter-sort-container">
        <input 
          type="text" 
          placeholder="Filtrar por detalle o usuario..." 
          value={filterText} 
          onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
          className="filter-input"
        />
      </div>
      {loading ? (
        <p>Cargando peticiones...</p>
      ) : (
        <>
          <table className="peticiones-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Detalle</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentPeticiones.map((peticion) => (
                <tr key={peticion._id}>
                  <td>{peticion.usuario?.nombre || "Usuario desconocido"}</td>
                  <td>{peticion.usuario?.email || "Sin correo"}</td>
                  <td>{peticion.detalle}</td>
                  <td><span className={`estado ${peticion.estado.toLowerCase()}`}>{peticion.estado}</span></td>
                  <td>
                    {peticion.estado === "pendiente" && (
                      <button className="btn aprobar" onClick={() => handleManage(peticion)}>
                        Gestionar
                      </button>
                    )}
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
        </>
      )}
      {showModal && selectedPeticion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2>Detalle de la Petición</h2>
            <p><strong>Usuario:</strong> {selectedPeticion.usuario?.nombre || "Usuario desconocido"}</p>
            <p><strong>Correo:</strong> {selectedPeticion.usuario?.email || "Sin correo"}</p>
            <p><strong>Detalle:</strong> {selectedPeticion.detalle}</p>
            <p><strong>Estado:</strong> {selectedPeticion.estado}</p>
            {selectedPeticion.nuevaFoto && (
              <div className="image-preview">
                <div className="preview-block">
                  <h3>Foto Actual</h3>
                  <img
                    src={selectedPeticion.usuario?.fotoPerfil || "/default-user.png"}
                    alt="Foto actual"
                    className="profile-pic"
                  />
                </div>
                <div className="preview-block">
                  <h3>Nueva Foto</h3>
                  <img
                    src={selectedPeticion.nuevaFoto}
                    alt="Nueva foto"
                    className="profile-pic"
                  />
                </div>
              </div>
            )}
            {selectedPeticion.nuevaContraseña && (
              <div className="password-reset-info">
                <h3>Solicitud de Cambio de Contraseña</h3>
                <p>
                  El usuario <strong>{selectedPeticion.usuario?.nombre || "desconocido"}</strong> solicita cambiar su contraseña.
                </p>
                <p><strong>Nueva Contraseña:</strong> {selectedPeticion.nuevaContraseña}</p>
                <p>Revise cuidadosamente esta solicitud antes de aprobar el cambio.</p>
              </div>
            )}
            <div className="modal-actions">
              <button onClick={handleReject} className="btn rechazar">Rechazar</button>
              <button onClick={handleApprove} className="btn aprobar">Aprobar</button>
              <button onClick={() => setShowModal(false)} className="btn cerrar">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Peticiones;