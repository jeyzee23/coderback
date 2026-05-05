function hasRole(role) {
  return (req, res, next) => {
    const userRole = req.session.user.role;

    if (userRole === role) {
      return next();
    }

    return res.status(403).json({
      error: `Acceso denegado. Se requiere rol "${role}", pero tu rol es "${userRole}".`,
    });
  };
}

module.exports = { hasRole };
