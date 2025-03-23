// Componente para listar, agregar, editar y eliminar usuarios, con filtros, ordenación y un modal de edición en dos columnas.
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./GestionUsuarios.css";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
    fotoPerfil: "",
    cedula: "",
    nacionalidad: "",
    sexo: "",
    fechaNacimiento: "",
    direccion: "",
    telefono: "",
  });
  const [filterRol, setFilterRol] = useState("todos");
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsuarios();
  }, [token]);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleOpenModal = (user = null) => {
    setShowModal(true);
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: "",
        rol: user.rol,
        fotoPerfil: user.fotoPerfil || "",
        cedula: user.cedula || "",
        nacionalidad: user.nacionalidad || "",
        sexo: user.sexo || "",
        fechaNacimiento: user.fechaNacimiento || "",
        direccion: user.direccion || "",
        telefono: user.telefono || "",
      });
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "usuario",
        fotoPerfil: "",
        cedula: "",
        nacionalidad: "",
        sexo: "",
        fechaNacimiento: "",
        direccion: "",
        telefono: "",
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoPerfil: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (!formData.nombre || !formData.email || !formData.rol) {
        toast.error("Todos los campos obligatorios deben ser completados");
        return;
      }
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/users/${currentUser.email}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Usuario actualizado correctamente");
      } else {
        await axios.post("http://localhost:5000/api/users", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Usuario agregado correctamente");
      }
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
      setShowModal(false);
    } catch (error) {
      toast.error("Error al guardar usuario");
      console.error(error);
    }
  };

  const handleDelete = async (email) => {
    if (window.confirm("¿Está seguro que desea eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(usuarios.filter(user => user.email !== email));
        toast.success("Usuario eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar usuario");
        console.error(error);
      }
    }
  };

  // Filtrado: por rol y por nombre/email.
  const filteredUsuarios = usuarios.filter(user => {
    const matchesRol = filterRol === "todos" ? true : user.rol === filterRol;
    const matchesText = user.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
                        user.email.toLowerCase().includes(filterText.toLowerCase());
    return matchesRol && matchesText;
  });

  // Ordenación por el campo seleccionado.
  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
    const fieldA = a[sortBy]?.toLowerCase();
    const fieldB = b[sortBy]?.toLowerCase();
    if (fieldA < fieldB) return -1;
    if (fieldA > fieldB) return 1;
    return 0;
  });

  return (
    <div className="gestion-usuarios-container">
      <h1>Gestión de Usuarios</h1>
      
      <div className="filter-sort-container">
        <input
          type="text"
          placeholder="Filtrar por nombre o email..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="filter-select"
        >
          <option value="todos">Todos</option>
          <option value="admin">Administrador</option>
          <option value="funcionario">Funcionario</option>
          <option value="usuario">Usuario</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="nombre">Ordenar por Nombre</option>
          <option value="email">Ordenar por Email</option>
          <option value="rol">Ordenar por Rol</option>
        </select>
      </div>
      
      <button className="btn agregar" onClick={() => handleOpenModal()}>
        Agregar Usuario
      </button>
      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsuarios.map((user) => (
            <tr key={user.email}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td>
                <button className="btn editar" onClick={() => handleOpenModal(user)}>
                  Editar
                </button>
                <button className="btn eliminar" onClick={() => handleDelete(user.email)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Usuario" : "Agregar Usuario"}</h2>
            <div className="modal-form-container">
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Nombre:</span>
                  <span className="modal-value">{formData.nombre || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Correo:</span>
                  <span className="modal-value">{formData.email || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isEditing}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Contraseña:</span>
                  <span className="modal-value">••••••••</span>
                </div>
                <div className="edit-field">
                  <input
                    type="password"
                    placeholder={isEditing ? "Dejar en blanco para mantener" : ""}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditing}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Rol:</span>
                  <span className="modal-value">{formData.rol || "-"}</span>
                </div>
                <div className="edit-field">
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="funcionario">Funcionario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Foto de Perfil:</span>
                  <span className="modal-value">
                    {formData.fotoPerfil ? (
                      <img src={formData.fotoPerfil} alt="Vista previa" className="image-preview" />
                    ) : (
                      "Sin foto"
                    )}
                  </span>
                </div>
                <div className="edit-field">
                  <input type="file" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Cédula:</span>
                  <span className="modal-value">{formData.cedula || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Nacionalidad:</span>
                  <span className="modal-value">{formData.nacionalidad || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.nacionalidad}
                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Sexo:</span>
                  <span className="modal-value">{formData.sexo || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Fecha de Nacimiento:</span>
                  <span className="modal-value">{formData.fechaNacimiento || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Dirección:</span>
                  <span className="modal-value">{formData.direccion || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="current-data">
                  <span className="modal-label">Teléfono:</span>
                  <span className="modal-value">{formData.telefono || "-"}</span>
                </div>
                <div className="edit-field">
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSaveUser} className="btn guardar">Guardar</button>
              <button onClick={() => setShowModal(false)} className="btn cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;