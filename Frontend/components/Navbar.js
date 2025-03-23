// Componente de la barra de navegación lateral con enlaces condicionales según el rol del usuario.
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isCollapsed, role }) => {
  return (
    <div className={`navbar ${isCollapsed ? "collapsed" : "expanded"}`}>
      <ul className="navbar-links">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            <i className="fas fa-home"></i>
            <span className="link-text">Inicio</span>
          </NavLink>
        </li>
        {role === "admin" && (
          <li>
            <NavLink to="/atickets" className="nav-link">
              <i className="fas fa-ticket-alt"></i>
              <span className="link-text">Gestión de Tickets</span>
            </NavLink>
          </li>
        )}
        {(role === "usuario" || role === "funcionario") && (
          <li>
            <NavLink to="/utickets" className="nav-link">
              <i className="fas fa-ticket-alt"></i>
              <span className="link-text">Mis Tickets</span>
            </NavLink>
          </li>
        )}
        {(role === "admin" || role === "funcionario") && (
          <li>
            <NavLink to="/peticiones" className="nav-link">
              <i className="fas fa-inbox"></i>
              <span className="link-text">Peticiones</span>
            </NavLink>
          </li>
        )}
        {role === "admin" && (
          <li>
            <NavLink to="/gestion-usuarios" className="nav-link">
              <i className="fas fa-users"></i>
              <span className="link-text">Usuarios</span>
            </NavLink>
          </li>
        )}
        {role === "usuario" && (
          <li>
            <NavLink to="/crear-ticket" className="nav-link">
              <i className="fas fa-plus-circle"></i>
              <span className="link-text">Crear Ticket</span>
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/profile" className="nav-link">
            <i className="fas fa-user"></i>
            <span className="link-text">Perfil</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/gestion-calendario" className="nav-link">
            <i className="fas fa-calendar-alt"></i>
            <span className="link-text">Gestión de Calendario</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;