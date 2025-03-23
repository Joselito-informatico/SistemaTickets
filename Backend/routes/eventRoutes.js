// Rutas para gestionar eventos.

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);

router.post(
  '/',
  [
    body('titulo').notEmpty().withMessage('El título es obligatorio').trim(),
    body('fecha').notEmpty().withMessage('La fecha es obligatoria').trim(),
    body('hora').notEmpty().withMessage('La hora es obligatoria').trim(),
    body('creadoPor').notEmpty().withMessage('El campo "creadoPor" es obligatorio').trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  eventController.createEvent
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('El ID debe ser un MongoID válido')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  eventController.deleteEvent
);

module.exports = router;