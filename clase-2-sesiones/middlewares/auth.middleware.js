function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({
    error: 'No autorizado. Debes iniciar sesion primero.',
  });
}

module.exports = { isAuthenticated };
