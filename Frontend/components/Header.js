import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./Header.css";

const Header = ({ toggleNavbar, isCollapsed, onLogout, role }) => {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Santiago",
      };
      setCurrentDateTime(new Intl.DateTimeFormat("es-CL", options).format(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showCalendar) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/events`)
        .then((response) => {
          const sortedEvents = response.data.sort(
            (a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`)
          );
          setEvents(sortedEvents);
        })
        .catch((error) => {
          console.error("Error al obtener eventos:", error);
        });
    }
  }, [showCalendar]);

  const goToProfile = () => navigate("/profile");

  const handleLogoutClick = () => {
    toast.info("Cerrando sesión...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setTimeout(() => {
      onLogout();
      navigate("/");
    }, 2100);
  };

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  const tituloIntranet =
    role === "admin"
      ? "Intranet Administrador"
      : role === "funcionario"
      ? "Intranet Funcionario"
      : "Intranet Usuario";

  return (
    <header className="header">
      <div className="header-left">
        <button
          className={`toggle-button ${isCollapsed ? "collapsed" : "expanded"}`}
          onClick={toggleNavbar}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? "☰" : "✖"}
        </button>
        <span className="header-title">{tituloIntranet}</span>
      </div>
      <div className="header-right">
        <span className="greeting">
          {`Hola, ${localStorage.getItem("nombre") || "Usuario"}`}
        </span>
        <button
          className="header-button profile"
          title="Perfil"
          onClick={goToProfile}
          aria-label="Ir al perfil"
        >
          <i className="fas fa-user-circle"></i>
        </button>
        <button
          className="header-button notifications"
          title="Notificaciones"
          aria-label="Ver notificaciones"
        >
          <i className="fas fa-bell"></i>
        </button>
        <button
          className="header-button calendar"
          title="Calendario"
          aria-label="Ver calendario"
          onClick={toggleCalendar}
        >
          <i className="fas fa-calendar-alt"></i>
        </button>
        <button
          className="header-button logout"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          onClick={handleLogoutClick}
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
      {/* Siempre se renderiza el sidebar, pero se le aplica la clase "visible" o "hidden" */}
      <div className={`calendar-sidebar ${showCalendar ? "visible" : "hidden"}`}>
        <div className="calendar-date-time">{currentDateTime}</div>
        <div className="calendar-events">
          <h3>Próximos Eventos</h3>
          <ul>
            {events.length === 0 ? (
              <li>No hay eventos programados</li>
            ) : (
              events.map((event, index) => (
                <li key={index}>
                  {event.fecha} {event.hora} - {event.titulo}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;