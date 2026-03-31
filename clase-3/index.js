import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { isAuthenticated } from "./middleware/isAuthenticated.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "secret_here";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const VALID_USER = {
  username: "admin",
  password: "1234",
  role: "admin",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: "clase3.sid",
    secret: SESSION_SECRET,
    // Evita regrabar sesiones sin cambios.
    resave: false,
    // No crea sesiones vacías antes del login.
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: IS_PRODUCTION,
      // Reduce el riesgo de CSRF en requests cross-site.
      sameSite: "lax",
    },
  }),
);

app.get("/", (req, res) => {
  res.send(
    "Clase 3 activa. Usa POST /login con username y password, luego GET /dashboard y POST /logout.",
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== VALID_USER.username || password !== VALID_USER.password) {
    return res.status(401).json({
      error: "Credenciales invalidas.",
    });
  }

  return req.session.regenerate((error) => {
    // Regenera el ID de sesión después del login para evitar session fixation.
    if (error) {
      return res.status(500).json({
        error: "No se pudo iniciar la sesion.",
      });
    }

    req.session.user = {
      username: VALID_USER.username,
      role: VALID_USER.role,
      loggedAt: new Date().toISOString(),
    };

    return res.json({
      message: "Login exitoso.",
      user: req.session.user,
    });
  });
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  return res.json({
    message: `Bienvenido ${req.session.user.username}.`,
    session: req.session.user,
  });
});

app.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((error) => {
    // Elimina la sesión del store; si falla, el usuario sigue autenticado.
    if (error) {
      return res.status(500).json({
        error: "No se pudo cerrar la sesion.",
      });
    }

    // También limpiamos la cookie que guarda el ID de sesión.
    res.clearCookie("clase3.sid", {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
    });

    return res.json({
      message: "Logout exitoso.",
    });
  });
});

app.listen(PORT, () => {
  console.log(`Clase 3 escuchando en http://localhost:${PORT}`);
});
