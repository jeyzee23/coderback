# Aplicación práctica - JWT, Passport, Cookies y Roles

## Ejecutar

```bash
cp .env.example .env
npm install
npm start
```

Requiere MongoDB disponible en `MONGODB_URI`.

El JWT usa el campo estándar `sub` para guardar el id del usuario. Los middlewares lo convierten a `req.user.id` para que el resto del código sea más fácil de leer.

La cookie usa `sameSite: 'Lax'`: esto ayuda a mitigar CSRF y mantiene funcionando la navegación normal entre sitios.

## Rutas principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/auth/register` | Crea usuario con rol `user`. |
| `POST` | `/auth/register-admin` | Crea admin usando encabezado `x-admin-setup-key`. |
| `POST` | `/auth/login-header` | Devuelve JWT para usar en `Authorization`. |
| `POST` | `/auth/login-cookie` | Guarda JWT en cookie `authToken`. |
| `POST` | `/auth/logout` | Limpia cookie `authToken`. |
| `GET` | `/resources/public` | Ruta pública. |
| `GET` | `/resources/private-header` | Ruta protegida por encabezado Authorization. |
| `GET` | `/resources/private-cookie` | Ruta protegida por cookie. |
| `GET` | `/resources/profile-passport` | Ruta protegida con Passport JWT. |
| `GET` | `/resources/admin` | Ruta admin validando rol del JWT. |
| `GET` | `/resources/admin-cookie` | Ruta admin validando cookie. |
| `GET` | `/resources/admin-db` | Ruta admin validando rol actual en MongoDB. |

## Errores esperados

- `401 Unauthorized`: token ausente, inválido o expirado.
- `403 Forbidden`: usuario autenticado sin rol suficiente.
