import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "secret_here";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    // Firma la cookie de sesión para detectar manipulaciones.
    secret: SESSION_SECRET,
    // Evita guardar la sesión otra vez si no cambió nada.
    resave: false,
    // No crea sesiones vacías para visitantes anónimos.
    saveUninitialized: false,
    cookie: {
      // Duración de la cookie en el navegador.
      maxAge: 60 * 1000,
      // Impide acceso a la cookie desde JS del cliente.
      httpOnly: true,
      // En producción debe ir en true cuando usás HTTPS.
      secure: false,
    },
  }),
);

app.get("/", (req, res) => {
  res.send(
    "Clase 2 activa. Usa /login?username=Juan, luego /dashboard y finalmente /logout.",
  );
});

app.get("/login", (req, res) => {
  const username = req.query.username || "Juan Videla";

  req.session.user = {
    username,
    user: username,
    loggedAt: new Date().toISOString(),
  };

  res.send(`Login exitoso. Sesion iniciada para ${username}.`);
});

app.get("/dashboard", AuthMiddleware,(req, res) => {
  // Este chequeo funciona como una protección básica de ruta.
  console.log(req.session);
  if (!req.session.user) {
    return res.status(401).send("No autorizado. Primero inicia sesion en /login.");
  }

  return res.send(
    `Bienvenido al dashboard, ${req.session.user.username}. Sesion creada en ${req.session.user.loggedAt}.`,
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    // Si falla destroy, la sesión puede seguir activa en el servidor.
    if (error) {
      return res.status(500).send("No se pudo cerrar la sesion.");
    }

    // Además de destruir la sesión, limpiamos la cookie del navegador.
    res.clearCookie("connect.sid");
    return res.send("Sesion finalizada correctamente.");
  });
});

app.listen(PORT, () => {
  console.log(`Clase 2 escuchando en http://localhost:${PORT}`);
});
