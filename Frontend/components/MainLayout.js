// Componente que envuelve la vista principal y renderiza el Header y Navbar.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      navigate("/");
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  const toggleNavbar = () => setIsCollapsed((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  if (!userRole) {
    return <div className="main-layout-loading">Cargando...</div>;
  }

  return (
    <div className={`main-layout ${isCollapsed ? "collapsed" : "expanded"}`}>
      <Header
        toggleNavbar={toggleNavbar}
        isCollapsed={isCollapsed}
        onLogout={handleLogout}
        role={userRole}
      />
      <div className="main-content">
        <Navbar isCollapsed={isCollapsed} role={userRole} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;