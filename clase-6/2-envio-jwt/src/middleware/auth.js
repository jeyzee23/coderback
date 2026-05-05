const { verifyAccessToken } = require('../utils/auth');

function authFromHeader(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido en el encabezado Authorization' });
  }

  // Bearer asjlkjdklsajdklsajfklsajdklas.dsakldhjsakjdhksad.dsahjdkhsajdkhsa
  // 0 , 1
  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function authFromCookie(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido en cookie' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { authFromHeader, authFromCookie };
