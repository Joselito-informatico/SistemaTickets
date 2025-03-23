import React, { useState } from "react";
import { useForm } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup"; 
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Modal from "react-modal";
import "./Login.css";
import LoadingScreen from "./LoadingScreen";
import api from "../services/api";

// Configurar React Modal
Modal.setAppElement("#root");

// Esquema de validación para el login
const loginSchema = yup.object().shape({
  email: yup.string().email("Debe ser un correo electrónico válido").required("El correo es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
  });
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [resetForm, setResetForm] = useState({ email: "", newPassword: "" });
  const [showResetModal, setShowResetModal] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      const { token, usuario } = response.data;
      if (isAdmin && usuario.rol !== "admin") {
        toast.error("Solo el rol ADMIN puede iniciar sesión con estos datos.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("role", usuario.rol);
      localStorage.setItem("email", usuario.email);
      localStorage.setItem("userId", usuario.id || usuario._id);
      localStorage.setItem("nombre", usuario.nombre);
      setLoggedUser(usuario);
      toast.success("Inicio de sesión exitoso!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        toast.error(
          status === 401
            ? "Credenciales incorrectas."
            : "Error al iniciar sesión. Inténtalo más tarde."
        );
      } else {
        toast.error("No se pudo conectar con el servidor.");
      }
      setLoading(false);
    }
  };  

  const handleResetPassword = async () => {
    let emailToSend = resetForm.email;
    if (!emailToSend.includes("@")) {
      emailToSend = `${emailToSend}@intranet.cl`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      toast.error("Introduce un correo válido.");
      return;
    }
    try {
      const response = await api.put("/users/reset-password", {
        email: emailToSend,
        nuevaContraseña: resetForm.newPassword,
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Error al restablecer contraseña.");
      console.error(error);
    }
    setShowResetModal(false);
  };

  if (loading) return <LoadingScreen user={loggedUser} />;

  return (
    <div className="container">
      <div className="form-background">
        <div className="logo-container">
          <img src="/loginlogo.png" alt="Logo" className="login-logo" />
        </div>
        <h1>Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="email" placeholder="Email*" {...register("email")} />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
          <input type="password" placeholder="Clave*" {...register("password")} />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
          <div className="login-options">
            <label>
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={() => setIsAdmin(prev => !prev)} 
              />
              Acceso Administrador
            </label>
            <button 
              type="button" 
              className="forgot-password" 
              onClick={() => setShowResetModal(true)}
            >
              ¿Olvidó su clave?
            </button>
          </div>
          <button type="submit" className="login-button" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
          <p className="sign-up-divider">o inicia con</p>
          <button 
            type="button" 
            className="gmail-login" 
            onClick={() => toast.info("Funcionalidad en desarrollo")}
          >
            Gmail Intranet
          </button>
        </form>
      </div>

      {/* Modal para restablecer contraseña */}
      {showResetModal && (
        <div className="modal-overlay reset-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowResetModal(false)}>
              &times;
            </button>
            <h2>Restablecer Contraseña</h2>
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={resetForm.email}
              onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={resetForm.newPassword}
              onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
              required
            />
            <div className="modal-buttons">
              <button onClick={handleResetPassword} className="btn aceptar">
                Aceptar
              </button>
              <button onClick={() => setShowResetModal(false)} className="btn cerrar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;