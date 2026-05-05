const express = require('express');
const User = require('../models/user');
const {
  createAccessToken,
  getAuthCookieOptions,
  getClearCookieOptions
} = require('../utils/auth');
const router = express.Router();

// Registra un usuario común. El rol queda fijo en user para evitar que alguien se cree admin desde el cuerpo de la petición.
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const user = new User({ email, password, role: 'user' });
    await user.save();

    res.status(201).json({
      message: 'Usuario registrado',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Registra un administrador de prueba usando una clave interna enviada por encabezado.
router.post('/register-admin', async (req, res) => {
  try {
    const setupKey = req.headers['x-admin-setup-key'];
    if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const user = new User({ email, password, role: 'admin' });
    await user.save();

    res.status(201).json({
      message: 'Administrador registrado',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar administrador' });
  }
});

// Valida credenciales y devuelve el JWT en JSON para usarlo como Authorization: Bearer <token>.
router.post('/login-header', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = createAccessToken(user);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Valida credenciales y guarda el JWT en la cookie httpOnly authToken.
router.post('/login-cookie', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = createAccessToken(user);

    res.cookie('authToken', token, getAuthCookieOptions());

    res.json({ message: 'Inicio de sesión exitoso' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Limpia la cookie authToken para cerrar el acceso autenticado por cookie.
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', getClearCookieOptions());
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
