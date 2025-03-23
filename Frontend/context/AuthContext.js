// Contexto para la autenticación y gestión del estado del usuario en toda la aplicación.

import React, { createContext, useState, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

export const AuthContext = createContext();
const queryClient = new QueryClient();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    email: localStorage.getItem("email") || null,
    userId: localStorage.getItem("userId") || null,
    nombre: localStorage.getItem("nombre") || null,
  });

  useEffect(() => {
    if (!auth.token) {
      logout();
    }
  }, []);

  const login = (data) => {
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.usuario.rol);
      localStorage.setItem("email", data.usuario.email);
      localStorage.setItem("userId", data.usuario.id);
      localStorage.setItem("nombre", data.usuario.nombre);
      setAuth({
        token: data.token,
        role: data.usuario.rol,
        email: data.usuario.email,
        userId: data.usuario.id,
        nombre: data.usuario.nombre,
      });
    }
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, email: null, userId: null, nombre: null });
    queryClient.clear();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, queryClient }}>
      {children}
    </AuthContext.Provider>
  );
};