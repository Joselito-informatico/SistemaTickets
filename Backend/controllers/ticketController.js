// Controlador para gestionar tickets: obtener, crear, actualizar, eliminar, asignar, enviar mensajes, cerrar/reabrir y actualizar estado.

const Ticket = require("../models/Ticket");
const path = require("path");

exports.getTickets = async (req, res) => {
  try {
    let tickets;
    // Rol admin ve todos; funcionario solo los asignados; usuario solo los creados.
    if (req.user.rol === "admin") {
      tickets = await Ticket.find().populate("creadoPor asignadoA", "nombre email rol");
    } else if (req.user.rol === "funcionario") {
      tickets = await Ticket.find({ asignadoA: req.user.id }).populate("creadoPor asignadoA", "nombre email rol");
    } else if (req.user.rol === "usuario") {
      tickets = await Ticket.find({ creadoPor: req.user.id }).populate("creadoPor asignadoA", "nombre email rol");
    } else {
      return res.status(403).json({ message: "No tienes permisos para ver estos tickets" });
    }
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    res.status(500).json({ message: "Error al obtener tickets" });
  }
};

exports.getMisTickets = async (req, res) => {
  try {
    let tickets;
    if (req.user.rol === "funcionario") {
      tickets = await Ticket.find({ asignadoA: req.user.id }).populate("creadoPor asignadoA", "nombre email rol");
    } else if (req.user.rol === "usuario") {
      tickets = await Ticket.find({ creadoPor: req.user.id }).populate("creadoPor asignadoA", "nombre email rol");
    } else {
      return res.status(403).json({ message: "No tienes permisos para ver estos tickets" });
    }
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error al obtener mis tickets:", error);
    res.status(500).json({ message: "Error al obtener mis tickets" });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("creadoPor asignadoA", "nombre email rol")
      .populate("mensajes.usuario", "nombre email rol");
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    // Si funcionario, verificar permiso
    if (req.user.rol === "funcionario" && ticket.asignadoA?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este ticket" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error al obtener el ticket:", error);
    res.status(500).json({ message: "Error al obtener el ticket" });
  }
};

exports.asignarTicket = async (req, res) => {
  try {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ message: "Solo los administradores pueden asignar tickets" });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    ticket.asignadoA = req.body.usuarioAsignado;
    await ticket.save();
    res.status(200).json({ message: "Ticket asignado correctamente" });
  } catch (error) {
    console.error("Error al asignar ticket:", error);
    res.status(500).json({ message: "Error al asignar ticket" });
  }
};

exports.crearTicket = async (req, res) => {
  try {
    const { titulo, categoria, subcategoria, descripcion, estado = "abierto" } = req.body;
    const creadoPor = req.user.id;
    if (!titulo || !categoria || !subcategoria || !descripcion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    const nuevoTicket = new Ticket({ titulo, categoria, subcategoria, descripcion, creadoPor, estado });
    await nuevoTicket.save();
    res.status(201).json(nuevoTicket);
  } catch (error) {
    console.error("Error al crear ticket:", error);
    res.status(500).json({ message: "Error al crear el ticket" });
  }
};

exports.actualizarTicket = async (req, res) => {
  try {
    const { titulo, categoria, subcategoria, descripcion } = req.body;
    // Si hay archivos, se procesan
    const archivos = req.files ? req.files.map((file) => file.path) : [];
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    ticket.titulo = titulo || ticket.titulo;
    ticket.categoria = categoria || ticket.categoria;
    ticket.subcategoria = subcategoria || ticket.subcategoria;
    ticket.descripcion = descripcion || ticket.descripcion;
    if (archivos.length > 0) {
      ticket.archivos = archivos;
    }
    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error al actualizar ticket:", error);
    res.status(500).json({ message: "Error al actualizar el ticket" });
  }
};

exports.eliminarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    res.status(200).json({ message: "Ticket eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar ticket:", error);
    res.status(500).json({ message: "Error al eliminar el ticket" });
  }
};

exports.getMensajes = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("mensajes.usuario", "nombre email rol");
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    res.status(200).json(ticket.mensajes);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

exports.agregarMensaje = async (req, res) => {
  try {
    const { mensaje, usuario } = req.body;
    const userId = usuario === "chatbot" ? null : req.user.id;
    if (!mensaje) return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    // Validar permisos para enviar mensaje
    if (
      usuario !== "chatbot" &&
      ticket.creadoPor.toString() !== userId &&
      ticket.asignadoA?.toString() !== userId &&
      req.user.rol !== "admin"
    ) {
      return res.status(403).json({ message: "No tienes permiso para enviar mensajes en este ticket" });
    }
    ticket.mensajes.push({
      usuario: usuario === "chatbot" ? { nombre: "Asistente Virtual", rol: "chatbot" } : req.user,
      mensaje,
    });
    await ticket.save();
    res.status(201).json(ticket.mensajes);
  } catch (error) {
    console.error("Error al agregar mensaje:", error);
    res.status(500).json({ message: "Error al agregar mensaje" });
  }
};

exports.cerrarTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    ticket.estado = "cerrado";
    await ticket.save();
    res.status(200).json({ message: "Ticket cerrado correctamente" });
  } catch (error) {
    console.error("Error al cerrar ticket:", error);
    res.status(500).json({ message: "Error al cerrar el ticket" });
  }
};

exports.reabrirTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    ticket.estado = "abierto";
    await ticket.save();
    res.status(200).json({ message: "Ticket reabierto correctamente", ticket });
  } catch (error) {
    console.error("Error al reabrir ticket:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }
    ticket.estado = estado;
    await ticket.save();
    res.json({ message: "Estado del ticket actualizado correctamente", ticket });
  } catch (error) {
    console.error("Error al actualizar estado del ticket:", error);
    res.status(500).json({ message: "Error al actualizar el estado del ticket" });
  }
};