// Rutas para la gestión de usuarios.

const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const userController = require("../controllers/userController");
const { protegerRuta } = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

// Ruta para resetear contraseña (pública)
router.put(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Debe proporcionar un correo electrónico válido"),
    body("nuevaContraseña").notEmpty().withMessage("La nueva contraseña es obligatoria")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.resetPassword
);

router.get("/profile", protegerRuta(["usuario", "funcionario", "admin"]), userController.getUserProfile);
router.get("/", protegerRuta(["admin", "funcionario", "usuario"]), userController.getAllUsers);
router.post(
  "/",
  protegerRuta(),
  requireRole("admin"),
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
    body("email").isEmail().withMessage("Debe ser un correo electrónico válido").normalizeEmail(),
    body("passwordHash").notEmpty().withMessage("La contraseña es obligatoria"),
    body("rol").isIn(["admin", "funcionario", "usuario"]).withMessage("Rol inválido"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.createUser
);
router.put("/:id", protegerRuta(["admin", "funcionario"]), userController.updateUser);

router.get("/random-funcionario", protegerRuta(["admin", "funcionario"]), requireRole("admin"), (req, res, next) => {
  const { getFuncionarioAleatorio } = require("../controllers/userController");
  getFuncionarioAleatorio(req, res, next);
});

module.exports = router;