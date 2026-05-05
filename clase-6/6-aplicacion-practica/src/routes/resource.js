const express = require('express');
const router = express.Router();
const {
  authenticateJWT,
  authenticateFromCookie,
  authenticateWithPassport,
  authorizeRoles,
  authorizeRolesFromDB
} = require('../middleware/auth');

// Ruta pública: sirve para comprobar que el servidor responde sin autenticación.
router.get('/public', (req, res) => {
  res.json({ message: 'Ruta pública accesible por todos' });
});

// Ruta privada por encabezado: requiere JWT válido en Authorization: Bearer <token>.
router.get('/private-header', authenticateJWT, (req, res) => {
  res.json({ message: 'Ruta privada vía encabezado Authorization', user: req.user });
});

// Ruta privada por cookie: requiere JWT válido dentro de la cookie authToken.
router.get('/private-cookie', authenticateFromCookie, (req, res) => {
  res.json({ message: 'Ruta privada vía cookie', user: req.user });
});

// Ruta protegida con Passport JWT: valida el token usando la estrategia passport-jwt.
router.get('/profile-passport', authenticateWithPassport, (req, res) => {
  res.json({ message: 'Perfil validado con Passport JWT', user: req.user });
});

// Ruta admin por encabezado: valida el rol admin que viene dentro del JWT.
router.get('/admin', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Panel de administración', user: req.user });
});

// Ruta admin por cookie: valida el rol admin usando el JWT guardado en authToken.
router.get('/admin-cookie', authenticateFromCookie, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Panel de administración vía cookie', user: req.user });
});

// Ruta admin contra MongoDB: consulta el rol actual para reflejar cambios de permisos al instante.
router.get('/admin-db', authenticateJWT, authorizeRolesFromDB('admin'), (req, res) => {
  res.json({ message: 'Panel de administración validado contra MongoDB', user: req.user });
});

module.exports = router;
