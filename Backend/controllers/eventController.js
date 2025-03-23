// Controlador para manejar eventos (obtener, crear y eliminar).

const Event = require('../models/Event');

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  const { titulo, fecha, hora, descripcion, creadoPor } = req.body;
  if (!titulo || !fecha || !hora || !creadoPor) {
    return res.status(400).json({ message: 'Todos los campos obligatorios' });
  }
  try {
    const event = new Event({ titulo, fecha, hora, descripcion, creadoPor });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};