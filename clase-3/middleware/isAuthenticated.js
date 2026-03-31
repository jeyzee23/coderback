export function isAuthenticated(req, res, next) {
  // Un middleware intercepta la request antes de llegar a la ruta final.
  if (!req.session?.user) {
    return res.status(401).json({
      error: "No autorizado. Debes iniciar sesion primero.",
    });
  }

  // Si la sesión es válida, cede el control a la siguiente función.
  return next();
}
