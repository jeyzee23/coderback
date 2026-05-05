const express = require('express');
const router = express.Router();
const { authenticateJWT, requireRole } = require('../middleware/auth');

// Ruta pública: permite comprobar que no todas las rutas requieren autenticación.
router.get('/public', (req, res) => {
  res.json({ message: 'Ruta pública - accesible por todos' });
});

// Ruta privada: requiere JWT válido, pero no exige un rol específico.
router.get('/private', authenticateJWT, (req, res) => {
  res.json({ message: 'Ruta privada - solo usuarios autenticados', user: req.user });
});

// Ruta admin: requiere JWT válido y rol admin.
router.get('/admin', authenticateJWT, requireRole('admin'), (req, res) => {
  res.json({ message: 'Panel de administración', user: req.user });
});

// Ruta moderador: requiere JWT válido y rol moderator.
router.get('/moderator', authenticateJWT, requireRole('moderator'), (req, res) => {
  res.json({ message: 'Panel de moderador', user: req.user });
});

module.exports = router;
