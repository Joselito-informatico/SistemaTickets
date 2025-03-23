// Rutas para la gestión de tickets.

const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { protegerRuta } = require("../middlewares/authMiddleware");
const { updateTicketStatus } = require("../controllers/ticketController");

router.get("/", protegerRuta(["admin", "funcionario", "usuario"]), ticketController.getTickets);
router.get("/mis-tickets", protegerRuta(["usuario", "funcionario"]), ticketController.getMisTickets);
router.get("/:id", protegerRuta(["admin", "funcionario", "usuario"]), ticketController.getTicketById);
router.post("/", protegerRuta(["usuario"]), ticketController.crearTicket);
router.put("/:id", protegerRuta(["admin", "funcionario"]), ticketController.actualizarTicket);
router.delete("/:id", protegerRuta(["admin"]), ticketController.eliminarTicket);
router.put("/:id/asignar", protegerRuta(["admin"]), ticketController.asignarTicket);
router.get("/:id/mensajes", protegerRuta(["admin", "funcionario", "usuario"]), ticketController.getMensajes);
router.post("/:id/mensajes", protegerRuta(["admin", "funcionario", "usuario"]), ticketController.agregarMensaje);
router.put("/:id/cerrar", protegerRuta(["admin", "funcionario"]), ticketController.cerrarTicket);
router.put("/:id/reabrir", protegerRuta(["admin", "funcionario"]), ticketController.reabrirTicket);
router.put("/:id/estado", updateTicketStatus);

module.exports = router;