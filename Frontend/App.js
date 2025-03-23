// Configuración de rutas con carga diferida (lazy) para mejorar el rendimiento.

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Carga perezosa de componentes para optimizar la carga inicial.
const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Peticiones = lazy(() => import("./components/Peticiones"));
const MainLayout = lazy(() => import("./components/MainLayout"));
const Profile = lazy(() => import("./components/Profile"));
const AdminTickets = lazy(() => import("./components/AdminTickets"));
const UserTickets = lazy(() => import("./components/UserTickets"));
const CrearTicket = lazy(() => import("./components/CrearTicket"));
const GestionUsuarios = lazy(() => import("./components/GestionUsuarios"));
const GestionCalendario = lazy(() => import("./components/GestionCalendario"));
const ADetalleTicket = lazy(() => import("./components/ADetalleTicket"));
const UDetalleTicket = lazy(() => import("./components/UDetalleTicket"));

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/peticiones" element={<MainLayout><Peticiones /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/atickets" element={<MainLayout><AdminTickets /></MainLayout>} />
          <Route path="/utickets" element={<MainLayout><UserTickets /></MainLayout>} />
          <Route path="/udetalleticket/:id" element={<MainLayout><UDetalleTicket /></MainLayout>} />
          <Route path="/adetalleticket/:id" element={<MainLayout><ADetalleTicket /></MainLayout>} />
          <Route path="/crear-ticket" element={<MainLayout><CrearTicket /></MainLayout>} />
          <Route path="/gestion-usuarios" element={<MainLayout><GestionUsuarios /></MainLayout>} />
          <Route path="/gestion-calendario" element={<MainLayout><GestionCalendario /></MainLayout>} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;