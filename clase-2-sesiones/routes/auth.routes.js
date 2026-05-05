const { Router } = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../config/database');

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos.' });
    }

    const usersCollection = getDB().collection('users');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      password: hashedPassword,
      role: role || 'user',
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        id: result.insertedId,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos.' });
    }

    const usersCollection = getDB().collection('users');

    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    req.session.user = {
      userId: user._id,
      username: user.username,
      role: user.role,
    };

    return res.json({
      message: 'Login exitoso.',
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesion:', err);
      return res.status(500).json({ error: 'Error al cerrar sesion.' });
    }

    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesion cerrada exitosamente.' });
  });
});

module.exports = router;
