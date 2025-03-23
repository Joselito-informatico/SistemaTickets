// Rutas para la autenticación: login y logout.

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const { protegerRuta } = require("../middlewares/authMiddleware");

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Debe proporcionar un correo electrónico válido").normalizeEmail(),
    body("password").notEmpty().withMessage("La contraseña es obligatoria")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);

router.post("/logout", protegerRuta(), authController.logout);
module.exports = router;