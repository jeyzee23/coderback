# Semana 6 - Autenticación JWT con Passport

## 1. Objetivo de la entrega

Esta entrega implementa autenticación sin estado con JSON Web Tokens en Express, integrando:

- JWT firmado con expiración de 1 hora.
- Passport.js con estrategia `passport-jwt`.
- Envío y recepción de tokens por `Authorization: Bearer <token>`.
- Envío y recepción de tokens por cookie `authToken`.
- Cookies con `httpOnly`, `secure` según entorno, `sameSite: Lax` y `maxAge`.
- Middlewares de autenticación y autorización por roles.
- Modelo MongoDB con contraseñas hasheadas mediante bcrypt.
- Custom callback de Passport para diferenciar errores de autenticación.

## 2. Estructura de carpetas

| Carpeta | Contenido |
| --- | --- |
| `1-jwt-passport-basico` | Configuración básica de Passport JWT y ruta protegida. |
| `2-envio-jwt` | Comparación práctica de envío por encabezado Authorization y cookie. |
| `3-recepcion-segura-jwt` | Recepción estandarizada de JWT por encabezado Authorization/cookie y errores 401. |
| `4-middleware-roles` | Middlewares `authenticateJWT`, `requireRole` y `requireRoleFromDB`. |
| `5-custom-callback-passport` | Ruta `/auth/profile` con custom callback de Passport. |
| `6-aplicacion-practica` | Aplicación integradora con Express, MongoDB, bcrypt, JWT, cookies y roles. |

## 3. Código principal comentado

### `6-aplicacion-practica/src/models/user.js`

Define el modelo de usuario en MongoDB con:

- `email` requerido y único.
- `password` requerido. Se mantiene el nombre técnico porque coincide con el campo recibido en JSON.
- `role` limitado a `user` o `admin`.
- Hook `pre('save')` para hashear la contraseña con bcrypt antes de persistir.
- Método `comparePassword` para validar credenciales durante el inicio de sesión.

### `6-aplicacion-practica/src/routes/auth.js`

Contiene las rutas de autenticación:

- `POST /auth/register`: registra usuarios normales con rol `user`.
- `POST /auth/register-admin`: registra administradores solo si se envía `x-admin-setup-key`.
- `POST /auth/login-header`: valida credenciales y devuelve el JWT en JSON para usarlo en `Authorization`.
- `POST /auth/login-cookie`: valida credenciales y guarda el JWT en la cookie `authToken`.
- `POST /auth/logout`: elimina la cookie `authToken`.

El token se firma con campos mínimos:

```js
{ sub: user._id, email: user.email, role: user.role }
```

`sub` significa `subject`: es el identificador del sujeto representado por el token. En esta entrega se usa para guardar el id del usuario y luego se normaliza como `req.user.id` dentro de los middlewares, para que el resto del código sea más legible.

La expiración configurada es `1h`.

### `6-aplicacion-practica/src/middleware/auth.js`

Contiene los middlewares reutilizables:

- `authenticateJWT`: extrae y valida `Authorization: Bearer <token>`.
- `authenticateFromCookie`: extrae y valida la cookie `authToken`.
- `authenticateWithPassport`: valida el JWT usando Passport y `passport-jwt`.
- `authorizeRoles`: autoriza contra el rol incluido en el JWT.
- `authorizeRolesFromDB`: consulta MongoDB para validar el rol actual del usuario.

Responde:

- `401 Unauthorized` si no hay token, es inválido o expiró.
- `403 Forbidden` si el usuario está autenticado pero no tiene el rol requerido.

## 4. Configuración

Crear `.env` desde `.env.example` dentro de `6-aplicacion-practica`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auth_jwt_db
JWT_SECRET=tu_secret_key_aqui_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRES_IN=1h
NODE_ENV=development
ADMIN_SETUP_KEY=cambiar_esta_clave_para_crear_admins
```

Instalar y levantar:

```bash
cd semana6/6-aplicacion-practica
npm install
npm start
```

## 5. Pruebas en Postman

### Registro de usuario

- Método: `POST`
- URL: `http://localhost:3000/auth/register`
- Body JSON:

```json
{
  "email": "user@test.com",
  "password": "123456"
}
```

Respuesta esperada: `201 Created`.

### Registro de administrador

- Método: `POST`
- URL: `http://localhost:3000/auth/register-admin`
- Encabezado: `x-admin-setup-key: cambiar_esta_clave_para_crear_admins`
- Body JSON:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

Respuesta esperada: `201 Created`.

### Inicio de sesión con token por encabezado Authorization

- Método: `POST`
- URL: `http://localhost:3000/auth/login-header`
- Body JSON:

```json
{
  "email": "user@test.com",
  "password": "123456"
}
```

Respuesta esperada: `200 OK` con `{ "token": "<jwt>" }`.

### Ruta protegida por encabezado Authorization

- Método: `GET`
- URL: `http://localhost:3000/resources/private-header`
- Encabezado: `Authorization: Bearer <token>`

Respuesta esperada: `200 OK`.

### Inicio de sesión con cookie

- Método: `POST`
- URL: `http://localhost:3000/auth/login-cookie`
- Body JSON:

```json
{
  "email": "user@test.com",
  "password": "123456"
}
```

Respuesta esperada: `200 OK` y cookie `authToken` creada.

### Ruta protegida por cookie

- Método: `GET`
- URL: `http://localhost:3000/resources/private-cookie`
- Cookie: `authToken=<jwt>`

Respuesta esperada: `200 OK`.

### Ruta solo admin

- Método: `GET`
- URL: `http://localhost:3000/resources/admin`
- Encabezado: `Authorization: Bearer <token_admin>`

Respuesta esperada con admin: `200 OK`.
Respuesta esperada con user normal: `403 Forbidden`.

### Ruta admin validando rol actual en MongoDB

- Método: `GET`
- URL: `http://localhost:3000/resources/admin-db`
- Encabezado: `Authorization: Bearer <token_admin>`

Respuesta esperada: `200 OK` si el usuario sigue teniendo rol `admin` en MongoDB.

## 6. Capturas solicitadas

Insertar en Google Docs capturas reales de Postman para:

1. Registro de usuario exitoso.
2. Inicio de sesión con recepción de token.
3. Acceso a ruta protegida usando encabezado Authorization.
4. Inicio de sesión con cookie `authToken`.
5. Acceso a ruta protegida usando cookie.
6. Acceso admin exitoso.
7. Acceso admin denegado con usuario normal.

## 7. Buenas prácticas aplicadas

- Contraseñas almacenadas como hash bcrypt, nunca en texto plano.
- JWT con campos mínimos y expiración de 1 hora.
- Separación entre autenticación y autorización.
- Uso correcto de `401` para falta/error de autenticación.
- Uso correcto de `403` para falta de permisos.
- Cookie `httpOnly` para reducir exposición ante XSS (cross-site scripting).
- Cookie `sameSite: Lax` para mitigar CSRF. `Lax` significa que el navegador no envía la cookie en la mayoría de peticiones automáticas entre sitios, pero sí permite navegación normal desde enlaces externos. Es un balance razonable para APIs y apps web.
- `secure: true` solo en producción para evitar problemas locales sin HTTPS.
- Registro normal sin capacidad de elegir rol `admin`.
- Middleware opcional de rol contra MongoDB para reflejar cambios de permisos inmediatamente.

## 8. Decisiones de organización del código

- `routes/auth.js` contiene rutas HTTP: registro, inicio de sesión y cierre de sesión.
- `middleware/auth.js` contiene funciones que se ejecutan antes del controlador: autenticar token y validar roles.
- `models/user.js` solo existe en la app integradora porque ahí hay MongoDB/Mongoose real.
- En prácticas con datos simulados se usa `repositories/userRepository.js`. No se llama `model` porque no es un modelo de base de datos, sino una capa simple de acceso a datos en memoria.
- Los helpers de JWT/cookies están en `utils/auth.js` o `utils/jwt.js` para evitar repetir secretos, expiración y opciones de cookie en varias rutas.
