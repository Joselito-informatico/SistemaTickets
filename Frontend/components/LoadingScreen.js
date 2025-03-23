// Componente para mostrar una pantalla de carga mientras se obtienen datos.

import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ user = {} }) => {
  const { fotoPerfil = '', nombre = '', email = '', rol = '' } = user || {};
  const imageUrl = fotoPerfil || (rol === 'admin' ? "/Icono Admin.png" : rol === "funcionario" ? "/Icono Funcionario.png" : "/Icono User.png");
  return (
    <div className="loading-screen">
      <div className="profile-simulation">
        <img src={imageUrl} alt="Foto de perfil" className="profile-pic" />
        <p className="profile-name">
          {nombre ? `Hola, ${nombre}` : email ? `Hola, ${email}` : "Bienvenido"}
        </p>
      </div>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">Cargando, por favor espere...</p>
    </div>
  );
};

export default LoadingScreen;