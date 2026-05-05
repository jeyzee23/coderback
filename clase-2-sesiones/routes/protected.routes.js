const { Router } = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

const router = Router();

router.get('/products', isAuthenticated, (req, res) => {
  const productos = [
    { id: 1, nombre: 'Laptop', precio: 999 },
    { id: 2, nombre: 'Mouse', precio: 25 },
    { id: 3, nombre: 'Teclado', precio: 75 },
  ];

  return res.json({
    message: `Hola ${req.session.user.username}, aca estan los productos.`,
    productos,
  });
});

router.get('/admin', isAuthenticated, hasRole('admin'), (req, res) => {
  return res.json({
    message: 'Bienvenido al panel de administracion.',
    user: req.session.user,
  });
});

module.exports = router;
