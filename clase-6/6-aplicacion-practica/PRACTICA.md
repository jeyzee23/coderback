# Práctica 6 - Aplicación práctica integradora

## Qué se pide

Construir un servidor Express con MongoDB que integre:

- Registro de usuarios.
- Contraseñas hasheadas con bcrypt.
- Login con JWT.
- Envío de token por encabezado Authorization.
- Envío de token por cookie.
- Middlewares de autenticación.
- Middlewares de autorización por rol.
- Rutas públicas, privadas y de administrador.
- Pruebas con Postman.
- Buenas prácticas de seguridad.

## Qué se realizó

Se creó una aplicación Express con:

- Modelo `User` de Mongoose.
- Hook `.pre('save')` para hashear contraseñas.
- Método `comparePassword` agregado al schema.
- Registro de usuarios comunes.
- Registro controlado de administradores con `x-admin-setup-key`.
- Login por encabezado Authorization.
- Login por cookie `authToken`.
- Validación JWT manual.
- Validación JWT con Passport.
- Autorización por rol desde el token.
- Autorización por rol consultando MongoDB.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/register` | Registra usuario común. |
| `POST` | `/auth/register-admin` | Registra administrador de prueba. |
| `POST` | `/auth/login-header` | Devuelve JWT en JSON. |
| `POST` | `/auth/login-cookie` | Guarda JWT en cookie `authToken`. |
| `POST` | `/auth/logout` | Borra cookie `authToken`. |
| `GET` | `/resources/public` | Ruta pública. |
| `GET` | `/resources/private-header` | Ruta privada por encabezado Authorization. |
| `GET` | `/resources/private-cookie` | Ruta privada por cookie. |
| `GET` | `/resources/profile-passport` | Ruta privada validada con Passport JWT. |
| `GET` | `/resources/admin` | Ruta admin validando rol del JWT. |
| `GET` | `/resources/admin-cookie` | Ruta admin validando cookie. |
| `GET` | `/resources/admin-db` | Ruta admin consultando rol actual en MongoDB. |

## Archivos importantes

- `src/models/user.js`: modelo Mongoose, bcrypt y método `comparePassword`.
- `src/routes/auth.js`: registro, login y logout.
- `src/routes/resource.js`: rutas públicas, privadas y admin.
- `src/middleware/auth.js`: autenticación y autorización.
- `src/config/passport.js`: estrategia Passport JWT.
- `src/utils/auth.js`: helpers de JWT y cookies.

## Buenas prácticas aplicadas

- No guardar contraseñas en texto plano.
- JWT con expiración de 1 hora.
- Cookies `httpOnly`.
- `secure` activado solo en producción.
- `sameSite: 'Lax'` para mitigar CSRF.
- Registro normal sin posibilidad de elegir rol admin.
- Separación entre rutas, middlewares, modelos y utilidades.

