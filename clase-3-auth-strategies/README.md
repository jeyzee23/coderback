# Coder Backend — Semana 4: Autenticación con JWT

Proyecto didáctico de la **Semana 4: Estrategia de autenticación por terceros + JWT** (Backend II).
Construido con **Express + JWT + bcrypt + MongoDB** (driver nativo), con estructura declarativa por capas.

> Continuación de [`clase-2-sesiones`](https://github.com/jeyzee23/clase-2-sesiones). Reutilizamos el mismo patrón de conexión a MongoDB y migramos el login de sesiones a JWT.

---

## Contenidos de la clase

1. Principales métodos de autenticación en aplicaciones web modernas
2. Aplicación de JWT en el desarrollo de aplicaciones
3. Configuración del servidor con Express y JWT
4. Guía para integrar JWT en una aplicación Express
5. Actividad práctica: **Refactor de login** (de sesiones → JWT)

---

## Requisitos previos

- **Node.js** ≥ 18
- **npm** (viene con Node)
- **MongoDB**: una de las dos opciones
  - MongoDB local corriendo en `localhost:27017`, **o**
  - Un cluster de **MongoDB Atlas** (free tier alcanza) — [atlas.mongodb.com](https://www.mongodb.com/atlas)
- **Postman** (o cualquier cliente HTTP) para probar los endpoints

---

## Setup paso a paso

### 1. Clonar e instalar

```bash
git clone https://github.com/jeyzee23/clase-3-auth-strategies.git
cd clase-3-auth-strategies
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá el `.env` y completá:

| Variable         | Qué poner                                                                 |
|------------------|---------------------------------------------------------------------------|
| `PORT`           | Puerto del server (default `8080`)                                        |
| `JWT_SECRET`     | Cualquier string largo y random. **No lo subas al repo.**                 |
| `JWT_EXPIRES_IN` | Duración del token: `1h`, `30m`, `7d`, etc.                               |
| `MONGODB_URI`    | Tu connection string de Mongo (local o Atlas — ver ejemplos en `.env.example`) |

**Importante:** el archivo `.env` está en `.gitignore`. Nunca lo subas con credenciales reales.

### 3. Arrancar el server

```bash
npm run dev   # modo watch (reinicia ante cambios)
# o
npm start
```

Si todo anduvo bien vas a ver:

```
✅ Conectado a MongoDB - base de datos: authdb
🚀 Server escuchando en http://localhost:8080
📚 Docs base: http://localhost:8080/api
```

### 4. Probar con Postman

1. Importá `postman_collection.json` en Postman.
2. Ejecutá los requests en este orden:
   1. **Register** → crea un usuario
   2. **Login** → devuelve el JWT (se guarda automáticamente en `{{token}}`)
   3. **Current** / **Profile** → rutas protegidas, usan el token
   4. **Logout** → borra la cookie + limpia `{{token}}` en Postman

---

## Estructura del proyecto

```
clase-3-auth-strategies/
├── src/
│   ├── app.js                  # Bootstrap: connectDB() + app.listen()
│   ├── config/
│   │   ├── config.js           # Lectura de .env
│   │   └── database.js         # connectDB() / getDB() (reusado de clase-2)
│   ├── controllers/
│   │   ├── auth.controller.js  # register / login / current / logout
│   │   └── users.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js  # authenticateJWT + authorize(roles)
│   ├── models/
│   │   └── user.model.js       # Colección "users" en Mongo + bcrypt
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   └── users.routes.js
│   └── utils/
│       └── jwt.js              # generateToken / verifyToken
├── .env.example
├── package.json
├── postman_collection.json
└── README.md
```

### Orden sugerido para explorar el código

1. `.env.example` y `src/config/` → cómo se configura el server.
2. `src/config/database.js` → conexión a Mongo (patrón reusado de clase-2).
3. `src/app.js` → el arranque espera a `connectDB()`.
4. `src/models/user.model.js` → persistencia + hashing con `bcrypt`.
5. `src/utils/jwt.js` → firma y verificación del token.
6. `src/controllers/auth.controller.js` → register / login.
7. `src/middlewares/auth.middleware.js` → cómo se protege una ruta.
8. `src/routes/` → ensamble final.
9. `postman_collection.json` → prueba end-to-end.

---

## Endpoints

Base URL: `http://localhost:8080/api`

| Método | Endpoint            | Descripción                                | Auth       |
|--------|---------------------|--------------------------------------------|------------|
| POST   | `/auth/register`    | Crea un usuario (hashea la password)       | ❌         |
| POST   | `/auth/login`       | Devuelve un JWT (body + cookie httpOnly)   | ❌         |
| GET    | `/auth/current`     | Devuelve el usuario del token              | ✅ JWT     |
| POST   | `/auth/logout`      | Limpia la cookie de sesión                 | ❌         |
| GET    | `/users/profile`    | Perfil del usuario autenticado             | ✅ JWT     |
| GET    | `/users`            | Listado de usuarios                        | ✅ admin   |

### Ejemplo de request

```http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@coder.com",
  "age": 30,
  "password": "1234"
}
```

```http
GET /api/auth/current
Authorization: Bearer <tu_token_jwt>
```

---

## Actividad práctica — Refactor de login

Objetivo: migrar el login clásico con sesiones (`clase-2-sesiones`) a una autenticación basada en JWT.

Criterios de éxito:

- [x] Contraseñas hasheadas con `bcrypt`
- [x] Token JWT firmado con `jsonwebtoken`
- [x] Middleware `authenticateJWT` que valida el token en cada request
- [x] Rutas protegidas que responden `401` / `403` según corresponda
- [x] Usuarios persistidos en MongoDB
- [x] Pruebas completas en Postman

---

## JWT: notas importantes para la clase

- **Stateless:** el server no guarda nada del token. No se puede "revocar" — solo expira. Por eso el `logout` es realmente del lado del cliente (olvidar el token).
- **TTL corto:** cuanto menor el `expiresIn`, menor la ventana de daño si el token se filtra.
- **Nunca** guardes el `JWT_SECRET` en el repo. Usá variables de entorno.
- El token no encripta, **firma**. Cualquiera que lo tenga puede leer el payload en [jwt.io](https://jwt.io). No metas datos sensibles adentro.

---

## Licencia

MIT — uso educativo para el curso de Coderhouse.
