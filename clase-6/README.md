# Semana 6 - JWT, Passport, Cookies y Roles

## Estado

La carpeta queda lista para usar con `.env` locales creados, colecciones Postman por actividad y la aplicación integradora conectada a MongoDB.

No hace falta API key externa. La configuración usa:

- `JWT_SECRET` para firmar tokens.
- `MONGODB_URI` solo en `6-aplicacion-practica`.
- `ADMIN_SETUP_KEY` para crear administradores de prueba.

Notas de lectura:

- `sub` en un JWT significa `subject`; en estos ejemplos guarda el id del usuario.
- `sameSite: 'Lax'` es una protección CSRF balanceada: limita envíos automáticos entre sitios sin romper navegación normal.
- Las prácticas sin MongoDB usan `repositories/` para datos en memoria; la integradora usa `models/` porque ahí sí hay Mongoose.

## Puertos

| Actividad | Carpeta | Puerto |
| --- | --- | --- |
| 1 | `1-jwt-passport-basico` | `3601` |
| 2 | `2-envio-jwt` | `3602` |
| 3 | `3-recepcion-segura-jwt` | `3603` |
| 4 | `4-middleware-roles` | `3604` |
| 5 | `5-custom-callback-passport` | `3605` |
| 6 | `6-aplicacion-practica` | `3606` |

## Ejecutar una actividad

```bash
cd semana6/6-aplicacion-practica
npm start
```

Cambiar la carpeta según la actividad que se quiera probar.

## Postman

Las colecciones están en:

```text
semana6/postman/
```

Importar la colección correspondiente a cada actividad. Cada colección trae `baseUrl` configurado con el puerto correcto y guarda automáticamente los tokens en variables de colección cuando corresponde.

## Consigna y resolución por actividad

Cada carpeta incluye un archivo `PRACTICA.md` con:

- qué pide el "Para practicar";
- qué se implementó;
- rutas para probar;
- archivos importantes.

Esto permite que los alumnos comparen la consigna con la solución del proyecto.

## Aplicación integradora

Rutas principales:

- `POST /auth/register`
- `POST /auth/register-admin`
- `POST /auth/login-header`
- `POST /auth/login-cookie`
- `POST /auth/logout`
- `GET /resources/public`
- `GET /resources/private-header`
- `GET /resources/private-cookie`
- `GET /resources/profile-passport`
- `GET /resources/admin`
- `GET /resources/admin-cookie`
- `GET /resources/admin-db`

Para crear admin en Postman usar el encabezado:

```text
x-admin-setup-key: semana6_admin_setup_key_dev
```
