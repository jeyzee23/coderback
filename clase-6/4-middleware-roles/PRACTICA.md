# Práctica 4 - Middleware personalizado para gestión de roles

## Qué se pide

Crear middlewares personalizados para controlar acceso por rol.

La práctica debe incluir:

- Middleware de autenticación JWT.
- Middleware `requireRole(role)`.
- Ruta pública.
- Ruta privada para usuarios autenticados.
- Ruta privada solo para administradores.
- Pruebas con Postman.
- Opción de consultar el rol actual desde una fuente de datos.

## Qué se realizó

Se creó un servidor Express con:

- Usuarios simulados en un repositorio en memoria.
- Login que genera JWT con el rol del usuario.
- Middleware `authenticateJWT`.
- Middleware `requireRole`.
- Middleware `requireRoleFromDB`, simulado contra el repositorio en memoria.
- Rutas públicas, privadas y restringidas por rol.

## Qué es un repositorio en memoria

Es una capa simple de acceso a datos basada en un arreglo local dentro del proyecto.

Se usa para practicar sin depender de MongoDB. En una aplicación real, esas funciones consultarían una base de datos con Mongoose.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/login` | Devuelve JWT con rol. |
| `GET` | `/resources/public` | Ruta pública. |
| `GET` | `/resources/private` | Ruta para cualquier usuario autenticado. |
| `GET` | `/resources/admin` | Ruta solo para rol `admin`. |
| `GET` | `/resources/moderator` | Ruta solo para rol `moderator`. |

## Usuarios de prueba

| Email | Contraseña | Rol |
| --- | --- | --- |
| `user@test.com` | `123` | `user` |
| `admin@test.com` | `123` | `admin` |
| `mod@test.com` | `123` | `moderator` |

## Archivos importantes

- `src/routes/auth.js`: login y generación de JWT.
- `src/routes/resource.js`: rutas públicas y protegidas.
- `src/middleware/auth.js`: autenticación y autorización por rol.
- `src/repositories/userRepository.js`: datos simulados.
- `src/utils/jwt.js`: creación y validación del JWT.

