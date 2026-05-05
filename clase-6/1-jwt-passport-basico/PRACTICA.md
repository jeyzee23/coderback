# Práctica 1 - Integración de JWT con Passport

## Qué se pide

Implementar una autenticación basada en JWT usando Passport.js y la estrategia `passport-jwt`.

La práctica debe permitir:

- Configurar Passport con `passport-jwt`.
- Extraer el token desde `Authorization: Bearer <token>`.
- Validar firma y expiración del JWT.
- Proteger una ruta para que solo acceda un usuario autenticado.
- Probar el flujo con Postman.

## Qué se realizó

Se creó un servidor Express con:

- Registro de usuarios de prueba en memoria.
- Inicio de sesión que genera un JWT.
- Configuración de Passport JWT.
- Middleware `authenticate` para proteger rutas.
- Ruta `/dashboard` protegida.
- Ruta `/auth/profile` protegida con Passport.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/register` | Registra un usuario de prueba. |
| `POST` | `/auth/login` | Devuelve un JWT válido. |
| `GET` | `/dashboard` | Ruta protegida por JWT. |
| `GET` | `/auth/profile` | Ruta protegida por Passport JWT. |

## Archivos importantes

- `src/config/passport.js`: estrategia `passport-jwt`.
- `src/middleware/auth.js`: middleware que ejecuta Passport.
- `src/routes/auth.js`: registro, login y perfil.
- `src/utils/jwt.js`: creación del JWT y configuración del secreto.

## Cómo probar

1. Levantar el servidor con `npm start`.
2. Registrar usuario con `POST /auth/register`.
3. Iniciar sesión con `POST /auth/login`.
4. Copiar el token recibido.
5. Enviar `Authorization: Bearer <token>` en `/dashboard` o `/auth/profile`.

