# Clase 4 - Práctica Integradora

API Express con autenticación JWT completa.

## Setup

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DB_NAME=users
JWT_SECRET=super-secret-key-change-me
JWT_EXPIRES_IN=24h
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Ejecutar

```bash
npm run dev
```

El servidor escucha en `http://localhost:8080`.

---

## Estructura del proyecto

```
src/
├── config/         # Configuración (DB, variables de entorno)
├── controllers/   # Lógica de negocio
├── middlewares/    # Autenticación y autorización
├── models/         # Modelos de datos
├── routes/         # Endpoints
├── utils/          # Utilidades (JWT)
└── app.js          # Entry point
```

---

## Endpoints

### Auth


| Método | Endpoint         | Descripción             | Requiere auth |
| ------ | ---------------- | ----------------------- | ------------- |
| POST   | `/auth/register` | Registrar nuevo usuario | No            |
| POST   | `/auth/login`    | Iniciar sesión          | No            |
| GET    | `/auth/current`  | Obtener usuario actual  | Sí            |
| POST   | `/auth/logout`   | Cerrar sesión           | Sí            |


### Users


| Método | Endpoint      | Descripción               | Requiere auth | Rol       |
| ------ | ------------- | ------------------------- | ------------- | --------- |
| GET    | `/users`      | Listar todos los usuarios | Sí            | admin     |
| GET    | `/users/:uid` | Obtener usuario por ID    | Sí            | cualquier |
| PUT    | `/users/:uid` | Actualizar usuario        | Sí            | cualquier |
| DELETE | `/users/:uid` | Eliminar usuario          | Sí            | admin     |


---

### POST /auth/register

Registra un nuevo usuario.

**Request:**

```json
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@coder.com",
  "age": 30,
  "password": "1234"
}
```

**Response (201):**

```json
{
  "status": "success",
  "payload": {
    "id": "abc123...",
    "first_name": "Juan",
    "last_name": "Perez",
    "email": "juan@coder.com",
    "age": 30,
    "role": "user",
    "createdAt": "2026-04-27T..."
  }
}
```

**Errores:**

- `400`: Faltan datos obligatorios
- `409`: El email ya está registrado

---

### POST /auth/login

Autentica al usuario y devuelve un token JWT en una cookie HttpOnly.

**Request:**

```json
{
  "email": "juan@coder.com",
  "password": "1234"
}
```

next();**Response (200):**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

El token se guarda en cookie con:

- `httpOnly: true` - No accesible desde JavaScript
- `maxAge: 24 * 60 * 60 * 1000` = 24 horas
- `secure: true` en producción
- `sameSite: 'strict'`

**Errores:**

- `400`: Email y password son requeridos
- `401`: Credenciales inválidas

---

### GET /auth/current

Devuelve los datos del usuario autenticado (extraídos del token JWT).

**Request:** Sin body. El token se envía en la cookie automáticamente.

**Response (200):**

```json
{
  "status": "success",
  "user": {
    "id": "abc123...",
    "email": "juan@coder.com",
    "first_name": "Juan",
    "role": "user"
  }
}
```

**Errores:**

- `401`: Token no provisto o inválido

---

### POST /auth/logout

Cierra la sesión del usuario eliminando la cookie.

**Request:** Sin body.

**Response (200):**

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

---

### GET /users

Lista todos los usuarios. Solo accesible para usuarios con rol `admin`.

**Request:** Sin body. Requiere autenticación.

**Response (200):**

```json
{
  "status": "success",
  "payload": [
    {
      "id": "abc123...",
      "first_name": "Juan",
      "last_name": "Perez",
      "email": "juan@coder.com",
      "role": "user",
      ...
    }
  ]
}
```

**Errores:**

- `401`: No autenticado
- `403`: No autorizado (no es admin)

---

### GET /users/:uid

Obtiene un usuario por su ID.

**Errores:**

- `401`: No autenticado

---

### PUT /users/:uid

Actualiza un usuario. Permite actualizar `first_name`, `last_name`, `age`.

**Request:**

```json
{
  "first_name": "Juan Updated",
  "age": 25
}
```

**Errores:**

- `401`: No autenticado

---

### DELETE /users/:uid

Elimina un usuario. Solo accesible para `admin`.

**Errores:**

- `401`: No autenticado
- `403`: No autorizado (no es admin)

---

## Manejo de errores


| Código | Significado                               |
| ------ | ----------------------------------------- |
| 400    | Bad Request - Datos inválidos o faltantes |
| 401    | Unauthorized - Token faltante o inválido  |
| 403    | Forbidden - Autenticado pero sin permisos |
| 409    | Conflict - Email ya registrado            |


Formato de respuesta de error:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

---

## Probar con Postman

### Importar colección

1. Abre Postman
2. Import -> Upload files
3. Selecciona `postman_collection.json`

### Flujo de pruebas

1. **Register**: Crea un usuario en `/auth/register`
2. **Login**: Inicia sesión en `/auth/login`. El token se guarda en cookie automáticamente
3. **Current**: Accede a `/auth/current` para verificar autenticación
4. **Get Users**: Prueba `/users` (solo funciona si el usuario tiene role `admin`)
5. **Logout**: Cierra sesión en `/auth/logout`

### Autenticación en Postman

El token JWT se transmite vía cookie HttpOnly. Postman la maneja automáticamente tras el login.

Para rutas que requieren autenticación desde variables, añade el header:

```
Authorization: Bearer <token>
```

---

## Ejemplo de token válido

Para pruebas, genera un token con este payload:

```javascript
// Playground jwt.io
// Algorithm: HS256
// Secret: super-secret-key-change-me

{
  "id": "abc123def456",
  "email": "juan@coder.com",
  "first_name": "Juan",
  "role": "admin",
  "iat": 1714242000,
  "exp": 1714328400
}
```

Token de ejemplo (24h de validez con el secret por defecto):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiYzEyM2RlZjQ1NiIsImVtYWlsIjoianVhbkBjb2Rlci5jb20iLCJmaXJzdF9uYW1lIjoiSnVhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNDI0MjAwMCwiZXhwIjoxNzA0MzI4NDAwfQ.dummy-signature
```

> **Nota**: Usa `/auth/register` para crear un usuario real y luego `/auth/login` para obtener un token válido.

---

## Cookies vs Authorization Header

- **Cookie**: Token enviado automáticamente en peticiones del navegador
- **Header**: Para clientes que no manejan cookies (Postman, mobile apps, etc.)

El middleware `authenticateJWT` acepta ambas formas:

```javascript
// Desde cookie
req.cookies.token

// O desde header
req.headers.authorization // Bearer <token>
```

