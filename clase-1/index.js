import express from "express";
import cookieParser from "cookie-parser";
import usernameRoutes from "./routes/usernameRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || "mi-clave-secreta";

app.use(cookieParser(COOKIE_SECRET));
app.use(usernameRoutes);

app.get("/", (req, res) => {
  res.send("Servidor de cookies funcionando.");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
