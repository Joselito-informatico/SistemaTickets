// Punto de entrada del servidor. Configura Express, MongoDB, middlewares y rutas.

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const peticionRoutes = require("./routes/peticionRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Servir archivos estáticos (ej. imágenes subidas)
app.use("/uploads", express.static("uploads"));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conexión a MongoDB Atlas exitosa"))
  .catch((err) => console.error("❌ Error de conexión:", err.message));

// Rutas API
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/peticiones", peticionRoutes);
app.use("/api/chatbot", chatbotRoutes); // Se usa una única ruta para el chatbot

// Ruta raíz para verificar que la API esté funcionando
app.get("/", (req, res) => {
  res.send("🚀 API en ejecución correctamente!");
});

// Middleware para manejar errores
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`⚙️ Servidor ejecutándose en http://localhost:${PORT}`);
});