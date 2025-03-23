import React, { useEffect, useState, useMemo } from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// Registrar plugins en ChartJS, incluyendo ChartDataLabels
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "usuario";
    setRole(storedRole);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token disponible, usuario no autenticado.");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const endpoint =
          role === "admin"
            ? `${process.env.REACT_APP_API_URL}/tickets`
            : `${process.env.REACT_APP_API_URL}/tickets/mis-tickets`;
        const ticketsRes = await axios.get(endpoint, config);
        setTickets(ticketsRes.data);
        if (role === "admin") {
          const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/users`, config);
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (role) fetchData();
  }, [role]);

  const userId = localStorage.getItem("userId");

  // Para usuario: tickets creados por el usuario
  const myTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (!ticket.creadoPor) return false;
      const creadorId =
        typeof ticket.creadoPor === "object" ? ticket.creadoPor._id : ticket.creadoPor;
      return creadorId === userId;
    });
  }, [tickets, userId]);

  const myOpenTicketsCount = myTickets.filter(
    (ticket) => ticket.estado.toLowerCase() === "abierto"
  ).length;
  const myClosedTicketsCount = myTickets.filter(
    (ticket) => ticket.estado.toLowerCase() === "cerrado"
  ).length;

  const totalUserPages = Math.ceil(myTickets.length / itemsPerPage);
  const currentUserTickets = myTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Para funcionario: tickets asignados al funcionario
  const assignedTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (!ticket.asignadoA) return false;
      if (typeof ticket.asignadoA === "object") {
        return ticket.asignadoA._id === userId;
      } else {
        return ticket.asignadoA === userId;
      }
    });
  }, [tickets, userId]);

  // Función auxiliar para renderizar el resumen en un solo label
  const renderChartSummary = (labels, data, unit = "") =>
    labels.map((label, i) => `${label}: ${data[i]} ${unit}`).join(" | ");

  // Configuración de ChartDataLabels para mostrar porcentajes
  const datalabelsOptions = {
    color: "white",
    anchor: "end",
    align: "start",
    formatter: (value, context) => {
      const dataArr = context.chart.data.datasets[0].data;
      const total = dataArr.reduce((acc, curr) => acc + curr, 0);
      return ((value / total) * 100).toFixed(1) + "%";
    },
    font: { weight: "bold", size: 14 },
  };

  // ADMIN: Tickets por Categoría
  const ticketsByCategory = useMemo(() => {
    const categories = {};
    tickets.forEach((ticket) => {
      categories[ticket.categoria] = (categories[ticket.categoria] || 0) + 1;
    });
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          label: "Tickets por Categoría",
          data: Object.values(categories),
          backgroundColor: ["#3498db", "#27ae60", "#e74c3c", "#f39c12"],
        },
      ],
    };
  }, [tickets]);

  // ADMIN: Tendencia de Tickets (todos los tickets)
  const ticketsTrend = useMemo(() => {
    const trend = {};
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    tickets.forEach((ticket) => {
      const date = new Date(ticket.fechaCreacion);
      const month = `${monthNames[date.getMonth()]} - ${date.getFullYear()}`;
      trend[month] = (trend[month] || 0) + 1;
    });
    const sortedMonths = Object.keys(trend).sort((a, b) => {
      // Para ordenar correctamente se puede comparar los años y los meses usando Date.parse
      return new Date(a) - new Date(b);
    });
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Tickets Creado por Mes",
          data: sortedMonths.map((month) => trend[month]),
          borderColor: "#5c4e96",
          fill: false,
        },
      ],
    };
  }, [tickets]);

  // ADMIN: Distribución de Usuarios
  const usersDistribution = useMemo(() => {
    const distribution = { admin: 0, funcionario: 0, usuario: 0 };
    users.forEach((user) => {
      distribution[user.rol] = (distribution[user.rol] || 0) + 1;
    });
    return {
      labels: ["Admin", "Funcionario", "Usuario"],
      datasets: [
        {
          label: "Distribución de Usuarios",
          data: [distribution.admin, distribution.funcionario, distribution.usuario],
          backgroundColor: ["#f39c12", "#27ae60", "#3498db"],
        },
      ],
    };
  }, [users]);

  // FUNCIONARIO: Tickets asignados por estado (solo "abierto" y "cerrado")
  const ticketsByStateForFuncionario = useMemo(() => {
    const states = { abierto: 0, cerrado: 0 };
    assignedTickets.forEach((ticket) => {
      const estado = ticket.estado.toLowerCase();
      if (estado === "abierto" || estado === "cerrado") {
        states[estado] = (states[estado] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(states),
      datasets: [
        {
          label: "Tickets por Estado",
          data: Object.values(states),
          backgroundColor: ["#e74c3c", "#27ae60"],
        },
      ],
    };
  }, [assignedTickets]);

  // FUNCIONARIO: Tickets asignados por Categoría
  const assignedTicketsByCategory = useMemo(() => {
    const categories = {};
    assignedTickets.forEach((ticket) => {
      categories[ticket.categoria] = (categories[ticket.categoria] || 0) + 1;
    });
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          label: "Tickets Asignados por Categoría",
          data: Object.values(categories),
          backgroundColor: ["#3498db", "#27ae60", "#e74c3c", "#f39c12"],
        },
      ],
    };
  }, [assignedTickets]);

  // FUNCIONARIO: Tendencia de Tickets Asignados
  const ticketsTrendForFuncionario = useMemo(() => {
    const trend = {};
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    assignedTickets.forEach((ticket) => {
      const date = new Date(ticket.fechaCreacion);
      const month = `${monthNames[date.getMonth()]} - ${date.getFullYear()}`;
      trend[month] = (trend[month] || 0) + 1;
    });
    const sortedMonths = Object.keys(trend).sort((a, b) => {
      // Para ordenar correctamente se puede comparar los años y los meses usando Date.parse
      return new Date(a) - new Date(b);
    });
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Tendencia de Tickets Asignados por Mes",
          data: sortedMonths.map((month) => trend[month]),
          borderColor: "#27ae60",
          fill: false,
        },
      ],
    };
  }, [assignedTickets]);

  // USUARIO: Gráfico Doughnut para "Mis Tickets"
  const userDonutData = {
    labels: ["Abiertos", "Cerrados"],
    datasets: [
      {
        data: [myOpenTicketsCount, myClosedTicketsCount],
        backgroundColor: ["#27ae60", "#e74c3c"],
      },
    ],
  };

  const userDonutOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: { weight: "bold", size: 16 },
        formatter: (value, context) => {
          const dataArr = context.chart.data.datasets[0].data;
          const total = dataArr.reduce((acc, curr) => acc + curr, 0);
          return ((value / total) * 100).toFixed(1) + "%";
        },
      },
      legend: {
        labels: { font: { size: 14, weight: "bold" } },
      },
    },
  };

  if (loading || !role) {
    return (
      <div className="dashboard-container">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Escritorio</h1>
      {role === "admin" && (
        <div className="admin-charts">
          <div className="chart-card">
            <h2>Tickets por Categoría</h2>
            <Bar data={ticketsByCategory} options={{ plugins: { datalabels: datalabelsOptions } }} />
            <p className="total-text">
              {renderChartSummary(ticketsByCategory.labels, ticketsByCategory.datasets[0].data)}
            </p>
          </div>
          <div className="chart-card">
            <h2>Tendencia de Tickets</h2>
            <Line data={ticketsTrend} />
            <p className="total-text">
              {renderChartSummary(ticketsTrend.labels, ticketsTrend.datasets[0].data)}
            </p>
          </div>
          <div className="chart-card">
            <h2>Distribución de Usuarios</h2>
            <Pie data={usersDistribution} options={{ plugins: { datalabels: datalabelsOptions } }} />
            <p className="total-text">
              {renderChartSummary(usersDistribution.labels, usersDistribution.datasets[0].data)}
            </p>
          </div>
        </div>
      )}
      {role === "funcionario" && (
        <div className="funcionario-charts">
          <div className="chart-card">
            <h2>Tickets Asignados por Estado</h2>
            <Bar
              data={ticketsByStateForFuncionario}
              options={{ indexAxis: "y", plugins: { datalabels: datalabelsOptions } }}
            />
            <p className="total-text">
              {renderChartSummary(ticketsByStateForFuncionario.labels, ticketsByStateForFuncionario.datasets[0].data, "")}
            </p>
          </div>
          <div className="chart-card">
            <h2>Tickets Asignados por Categoría</h2>
            <Bar data={assignedTicketsByCategory} options={{ plugins: { datalabels: datalabelsOptions } }} />
            <p className="total-text">
              {renderChartSummary(assignedTicketsByCategory.labels, assignedTicketsByCategory.datasets[0].data)}
            </p>
          </div>
          <div className="chart-card">
            <h2>Tendencia de Tickets Asignados</h2>
            <Line data={ticketsTrendForFuncionario} />
            <p className="total-text">
              {renderChartSummary(ticketsTrendForFuncionario.labels, ticketsTrendForFuncionario.datasets[0].data)}
            </p>
          </div>
          <div className="tickets-list">
            <h2>Mis Tickets Asignados</h2>
            <ul>
              {assignedTickets.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              ).map((ticket) => (
                <li key={ticket._id} onClick={() => navigate(`/adetalleticket/${ticket._id}`)}>
                  {ticket.titulo} - {ticket.estado}
                </li>
              ))}
            </ul>
            {Math.ceil(assignedTickets.length / itemsPerPage) > 1 && (
              <div className="pagination-user">
                {Array.from({ length: Math.ceil(assignedTickets.length / itemsPerPage) }, (_, index) => (
                  <button
                    key={index + 1}
                    className={currentPage === index + 1 ? "active-page" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {role === "usuario" && (
        <div className="user-dashboard-container">
          <div className="chart-card user-chart-card">
            <h2>Mis Tickets</h2>
            <Doughnut data={userDonutData} options={userDonutOptions} />
            <p className="total-text">
              Abiertos: {myOpenTicketsCount} | Cerrados: {myClosedTicketsCount}
            </p>
          </div>
          <div className="tickets-list">
            <h2>Mis Tickets</h2>
            <ul>
              {currentUserTickets.map((ticket) => (
                <li key={ticket._id} onClick={() => navigate(`/udetalleticket/${ticket._id}`)}>
                  {ticket.titulo} - {ticket.estado}
                </li>
              ))}
            </ul>
            {totalUserPages > 1 && (
              <div className="pagination-user">
                {Array.from({ length: totalUserPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={currentPage === index + 1 ? "active-page" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para generar el resumen en una línea
const renderChartSummary = (labels, data, unit = "tickets") => {
  return labels.map((label, i) => `${label}: ${data[i]} ${unit}`).join(" | ");
};

export default Dashboard;