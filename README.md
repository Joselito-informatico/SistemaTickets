# 🛠️ Sistema de Gestión de Tickets - SistemaTickets

Proyecto desarrollado como parte de una práctica profesional. El sistema permite a usuarios crear y gestionar tickets de ayuda, mientras que los administradores pueden supervisar, asignar y cerrar solicitudes. Este repositorio es la base para futuros desarrollos.

> 🔧 **Stack Tecnológico**: React 18 + Node.js + Express + MongoDB

---

## 📸 Capturas de Pantalla

- ![Login](./assets/screenshots/login.png)
- ![Dashboard](./assets/screenshots/dashboard.png)
- ![Detalle Ticket](./assets/screenshots/detalle_ticket.png)

---

## 🚀 Cómo ejecutar el proyecto

### 📦 Requisitos previos
- Node.js (versión LTS recomendada)
- MongoDB (local o MongoDB Atlas)

---

### 🧩 Clonar el repositorio

```
git clone https://github.com/Joselito-informatico/SistemaTickets.git
cd SistemaTickets
```

---

### 🔧 Configuración del Backend

```
cd Backend
npm install
```

#### 📝 Configura las variables de entorno en un archivo `.env`:

```env
PORT=5000
MONGO_URI=mongodb:tu_mongo_uri
JWT_SECRET=tu_clave_secreta
```

#### ▶️ Ejecutar el servidor

```
npm run dev
```

> El backend quedará disponible en `http://localhost:5000/api`

---

### 💻 Configuración del Frontend

```
cd ../Frontend
npm install
```

#### 📝 Configura el archivo `.env` en la raíz de `Frontend`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### ▶️ Ejecutar el cliente

```
npm start
```

> La aplicación se abrirá automáticamente en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
SistemaTickets/
├── Backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── logger.js
│   └── app.js
└── Frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── services/
        └── App.js
```

---

## 💡 Posibles mejoras

- 🧠 Integración completa de un chatbot de IA.
- 📊 Panel de estadísticas más avanzado con filtros y exportación.
- 📂 Soporte para adjuntar archivos en los tickets.
- 🔔 Sistema de notificaciones en tiempo real.
- 🌐 Internacionalización (multi-idioma).
- 👥 Roles más detallados (superadmin, soporte, etc.)

---

## 📌 Estado del Proyecto

> 🎯 **Base finalizada** – funcional para gestión básica de tickets. Ideal para extender con nuevas funcionalidades.

---

## 👨‍💻 Autor

- **Joselito-informatico**  
  GitHub: [@Joselito-informatico](https://github.com/Joselito-informatico)

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.  
Consulta el archivo [LICENSE](./LICENSE) para más información.

---
