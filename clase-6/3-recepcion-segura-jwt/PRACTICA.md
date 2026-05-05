# Práctica 3 - Recepción segura de JWT en Express

## Qué se pide

Estandarizar cómo el servidor recibe JWT por:

- Encabezado `Authorization: Bearer <token>`.
- Cookie `authToken`.

También se pide responder de forma consistente ante errores:

- Token ausente.
- Token inválido.
- Token expirado.

## Qué se realizó

Se creó un servidor Express con:

- Middleware `authFromHeader`.
- Middleware `authFromCookie`.
- Respuesta `401 Unauthorized` si falta el token o no es válido.
- Cookie `authToken` con `httpOnly`, `secure`, `sameSite: 'Lax'` y `maxAge`.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/login-header` | Genera JWT para usar por encabezado. |
| `POST` | `/auth/login-cookie` | Genera JWT y lo guarda en cookie. |
| `POST` | `/auth/logout` | Borra la cookie. |
| `GET` | `/protected-header` | Valida token desde encabezado Authorization. |
| `GET` | `/protected-cookie` | Valida token desde cookie `authToken`. |

## Archivos importantes

- `src/middleware/auth.js`: validación de token por encabezado y cookie.
- `src/routes/auth.js`: emisión de tokens y cookie.
- `src/utils/auth.js`: helpers reutilizables de JWT y cookie.

## Respuestas esperadas

Si el token falta, expiró o es inválido:

```json
{
  "error": "Token no proporcionado"
}
```

o:

```json
{
  "error": "Token inválido o expirado"
}
```

