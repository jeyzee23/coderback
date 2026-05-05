# Práctica 2 - Formas de enviar JWT

## Qué se pide

Explorar dos formas principales de enviar un JWT desde el cliente al servidor:

- Encabezado `Authorization: Bearer <token>`.
- Cookie segura `authToken`.

La práctica debe comparar facilidad de uso y riesgos de seguridad entre ambos métodos.

## Qué se realizó

Se creó un servidor Express con:

- Inicio de sesión que devuelve el JWT en JSON para usarlo en el encabezado Authorization.
- Inicio de sesión que guarda el JWT en una cookie `authToken`.
- Ruta protegida por encabezado Authorization.
- Ruta protegida por cookie.
- Cierre de sesión que borra la cookie.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/login-header` | Devuelve un JWT para enviarlo por encabezado Authorization. |
| `POST` | `/auth/login-cookie` | Guarda el JWT en la cookie `authToken`. |
| `POST` | `/auth/logout` | Borra la cookie `authToken`. |
| `GET` | `/protected-header` | Valida JWT desde encabezado Authorization. |
| `GET` | `/protected-cookie` | Valida JWT desde cookie `authToken`. |

## Archivos importantes

- `src/routes/auth.js`: login por encabezado, login por cookie y logout.
- `src/middleware/auth.js`: extracción del token desde encabezado o cookie.
- `src/utils/auth.js`: creación/verificación del JWT y opciones de cookie.

## Decisiones de seguridad

- `httpOnly`: evita que JavaScript lea la cookie.
- `secure`: se activa solo en producción para exigir HTTPS.
- `sameSite: 'Lax'`: ayuda a mitigar CSRF sin romper navegación normal.

