// Rutas para gestionar peticiones de los usuarios.

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const peticionController = require('../controllers/peticionController');
const { protegerRuta } = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

router.get('/', protegerRuta(["admin", "funcionario"]), peticionController.getAllPeticiones);

router.post(
  '/',
  protegerRuta(),
  [
    body('usuario').notEmpty().withMessage('El campo "usuario" es obligatorio'),
    body('detalle').notEmpty().withMessage('El detalle es obligatorio'),
    body('nuevaFoto').notEmpty().withMessage('La nueva foto es obligatoria')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  peticionController.createPeticion
);

router.put(
  '/:id/aprobar',
  protegerRuta(),
  requireRole('admin', 'funcionario'),
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
  peticionController.approvePeticion
);

router.put(
  '/:id/rechazar',
  protegerRuta(),
  requireRole('admin', 'funcionario'),
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
  peticionController.rejectPeticion
);

module.exports = router;