# Práctica 5 - Custom callback en Passport

## Qué se pide

Implementar un endpoint protegido con Passport JWT usando custom callback.

La práctica debe manejar:

- Token ausente.
- Token expirado.
- Token inválido.
- Usuario no encontrado.
- Autenticación exitosa.
- Registro en consola de cada evento relevante.

## Qué se realizó

Se creó un servidor Express con:

- Configuración `passport-jwt`.
- Login que genera JWT.
- Ruta `/auth/profile` protegida con Passport.
- Custom callback para decidir manualmente la respuesta HTTP.
- Función `buildAuthErrorResponse` para centralizar respuestas de error.
- Logs de autenticación exitosa y fallida.

## Dónde está el custom callback

Está en `src/routes/auth.js`, dentro de:

```js
const passportMiddleware = passport.authenticate('jwt', { session: false }, (err, user, passportInfo) => {
  // manejo manual del resultado
});
```

Ese tercer argumento es el custom callback.

## Rutas para probar

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| `POST` | `/auth/login` | Devuelve JWT válido. |
| `GET` | `/auth/profile` | Ruta protegida con custom callback. |

## Archivos importantes

- `src/config/passport.js`: estrategia `passport-jwt`.
- `src/routes/auth.js`: login, ruta protegida y custom callback.
- `src/repositories/userRepository.js`: usuarios simulados.
- `src/utils/jwt.js`: creación del JWT.

## Respuestas esperadas

- `401`: token ausente, inválido o expirado.
- `404`: usuario no encontrado.
- `500`: error interno.
- `200`: autenticación exitosa.

