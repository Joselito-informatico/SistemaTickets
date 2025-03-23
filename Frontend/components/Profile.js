// Componente que muestra el perfil del usuario y permite solicitar cambio de foto.

import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && Object.keys(response.data).length > 0) {
          setUser(response.data);
        } else {
          console.warn("El endpoint devolvió un objeto vacío.");
        }
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        toast.error("Error al obtener el perfil");
      }
    };
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePicture = async () => {
    if (!previewImage) return;
    try {
      if (user.rol === "usuario") {
        await api.post(
          "/peticiones",
          { usuario: user._id, detalle: "Cambio de foto de perfil", nuevaFoto: previewImage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.info("Solicitud enviada para aprobación.");
      } else {
        await api.put(
          `/users/${user._id}`,
          { fotoPerfil: previewImage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser({ ...user, fotoPerfil: previewImage });
        toast.success("Foto de perfil actualizada.");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      toast.error("Error al actualizar la foto de perfil.");
    }
  };

  if (!user) {
    return (
      <div className="profile-container loading">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture-wrapper" onClick={() => setShowModal(true)}>
          <img src={user.fotoPerfil || "/default-avatar.png"} alt="Foto de perfil" className="profile-picture" />
          <div className="profile-overlay">Seleccionar</div>
        </div>
        <h1 className="profile-name">{user.nombre}</h1>
      </div>
      <div className="profile-details">
        <ul>
          <li><strong>Cédula:</strong> {user.cedula || "No especificado"}</li>
          <li><strong>Correo:</strong> {user.email}</li>
          <li><strong>Nacionalidad:</strong> {user.nacionalidad || "No especificado"}</li>
          <li><strong>Sexo:</strong> {user.sexo || "No especificado"}</li>
          <li><strong>Fecha de Nacimiento:</strong> {user.fechaNacimiento || "No especificado"}</li>
          <li><strong>Dirección:</strong> {user.direccion || "No especificado"}</li>
          <li><strong>Teléfono:</strong> {user.telefono || "No especificado"}</li>
        </ul>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Seleccionar una foto de perfil</h2>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {previewImage && (
              <img src={previewImage} alt="Vista previa" className="image-preview" />
            )}
            <div className="modal-buttons">
              <button onClick={handleSavePicture}>Guardar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;