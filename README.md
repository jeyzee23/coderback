# Backend II - Cookies y Sesiones

Proyecto de apoyo para alumnos con ejemplos progresivos de cookies y sesiones usando Node.js, Express, `cookie-parser` y `express-session`.

## Contenido del proyecto

- `clase-1/`: cookies firmadas
- `clase-2/`: sesión básica con login, dashboard y logout
- `clase-3/`: flujo de autenticación con middleware `isAuthenticated`
- `postman/`: colección lista para importar en Postman

## Requisitos

Antes de comenzar, necesitás tener instalado:

- Node.js 18 o superior
- npm
- Postman opcional, si querés probar las rutas desde una interfaz

## Instalación

1. Cloná el repositorio:

```bash
git clone git@github.com:jeyzee23/coderback.git
cd coderback
```

2. Instalá las dependencias:

```bash
npm install
```

## Variables de entorno

Podés crear un archivo `.env` si querés personalizar secretos, aunque para la práctica el proyecto ya tiene valores por defecto en el código.

Variables útiles:

- `PORT=3000`
- `SESSION_SECRET=tu_secreto`
- `COOKIE_SECRET=tu_clave_para_cookies`
- `NODE_ENV=development`

## Importante sobre el puerto

Las tres clases usan el puerto `3000` por defecto.

Eso significa que:

- se ejecutan de a una
- antes de correr otra clase, tenés que frenar la anterior con `Ctrl + C`

## Cómo levantar cada clase

### Clase 1 - Cookies firmadas

```bash
npm run start:clase1
```

Rutas principales:

- `GET /set-username`
- `GET /get-username`
- `GET /logout`

## Flujo sugerido

1. Abrí `http://localhost:3000/set-username`
2. Luego abrí `http://localhost:3000/get-username`
3. Finalmente abrí `http://localhost:3000/logout`

### Clase 2 - Sesión básica

```bash
npm run start:clase2
```

Rutas principales:

- `GET /login?username=Juan`
- `GET /dashboard`
- `GET /logout`

## Flujo sugerido

1. Abrí `http://localhost:3000/login?username=Juan`
2. Luego abrí `http://localhost:3000/dashboard`
3. Cerrá sesión con `http://localhost:3000/logout`

### Clase 3 - Autenticación con middleware

```bash
npm run start:clase3
```

Rutas principales:

- `POST /login`
- `GET /dashboard`
- `POST /logout`

Credenciales de prueba:

- usuario: `admin`
- contraseña: `1234`

## Ejemplo de login con curl

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"1234"}'
```

## Colección de Postman

Dentro del proyecto tenés este archivo:

- `postman/sesiones-clases.postman_collection.json`

Para importarlo:

1. Abrí Postman
2. Hacé clic en `Import`
3. Elegí el archivo `postman/sesiones-clases.postman_collection.json`
4. Ejecutá la carpeta de la clase que estés corriendo en ese momento

La colección usa `localhost:3000`, así que no hace falta cambiar nada si levantás el proyecto con la configuración por defecto.

## Dependencias usadas

- `express`
- `cookie-parser`
- `express-session`

## Objetivo pedagógico

Este proyecto está pensado para mostrar, paso a paso:

1. cómo crear y leer cookies
2. cómo iniciar y destruir sesiones
3. cómo proteger rutas con middleware
4. cómo modelar un login básico en backend

## Nota final

Este proyecto está orientado a práctica y aprendizaje.

Para producción, conviene:

- usar HTTPS
- guardar secretos fuera del código
- usar un session store externo como Redis
- ajustar flags de seguridad como `secure` y `sameSite`
# Coder Backend

Repositorio unificado para las clases del curso backend.

## Clases

- `clase-1/`, `clase-2/`, `clase-3/`: ejemplos iniciales de sesiones incluidos en la primera entrega.
- `clase-2-sesiones/`: sesiones, cookies y almacenamiento de sesión.
- `clase-3-auth-strategies/`: estrategias de autenticación.
- `clase-4-practica-integradora/`: práctica integradora con autenticación.
- `clase-6/`: JWT, Passport, cookies, roles y custom callback.

Cada carpeta mantiene su propio `package.json`, README y colecciones Postman cuando corresponde.

No se versionan `.env` ni `node_modules`.
