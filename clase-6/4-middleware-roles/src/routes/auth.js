const express = require('express');
const router = express.Router();
const { findUserByEmail } = require('../repositories/userRepository');
const { createAccessToken } = require('../utils/jwt');

// Valida credenciales contra usuarios simulados y devuelve un JWT con el rol.
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);

  res.json({ token });
});

module.exports = router;
