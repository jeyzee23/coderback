import { Router } from "express";

const router = Router();
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 60 * 60 * 1000,
  signed: true,
};

router.get("/set-username", (req, res) => {
  res.cookie("username", "Juan Videla", COOKIE_OPTIONS);
  res.send("Cookie firmada 'username' creada correctamente.");
});

router.get("/get-username", (req, res) => {
  const username = req.signedCookies.username;

  if (!username) {
    return res.status(404).send("No se encontro la cookie firmada 'username'.");
  }

  return res.send(`Username guardado en cookie: ${username}`);
});

router.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.send("Cookie 'username' eliminada correctamente.");
});

export default router;
