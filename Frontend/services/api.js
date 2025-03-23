// Configuración de Axios para las peticiones a la API.

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (!config.url.includes("/api/users/reset-password")) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la API:", error.response || error.message);
    return Promise.reject(error);
  }
);

// Funciones auxiliares
export const getTicketById = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicketStatus = async (id, estado) => {
  try {
    const response = await axios.put(`${API_URL}/tickets/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del ticket:", error);
    throw error;
  }
};

export default api;