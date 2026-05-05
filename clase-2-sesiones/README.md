# Backend II - Clase 2: Autenticacion con Sesiones

Proyecto de clase para aprender autenticacion con sesiones en Express. Incluye registro, login, logout, rutas protegidas y autorizacion por rol, con soporte para distintos session stores (memory, file, mongo).

## Requisitos previos

Antes de comenzar, asegurate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [Postman](https://www.postman.com/downloads/) (para probar los endpoints)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (cuenta gratuita) o MongoDB local

Para verificar que tenes Node.js instalado:

```bash
node -v
npm -v
```

## Instalacion paso a paso

### 1. Clonar el repositorio

```bash
git clone git@github.com:jeyzee23/clase-2-sesiones.git
cd clase-2-sesiones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Abrir `.env` y completar con tus datos. Las variables disponibles son:

| Variable | Descripcion | Valores posibles | Obligatoria |
|---|---|---|---|
| `PORT` | Puerto del servidor | `3000` (default) | No |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesion | cualquier string seguro | Si |
| `NODE_ENV` | Entorno de ejecucion | `development` / `production` | No |
| `SESSION_STORE` | Donde se guardan las sesiones | `memory` / `file` / `mongo` | No (default: `memory`) |
| `MONGODB_URI` | URI de conexion a MongoDB | tu string de conexion | Si |

> **Importante:** `MONGODB_URI` es obligatoria porque la base de datos de usuarios siempre se guarda en MongoDB, independientemente del session store que elijas.

### 4. Configurar MongoDB Atlas (si no lo tenes)

1. Crear una cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito (M0 Free Tier)
3. En **Database Access**, crear un usuario con password
4. En **Network Access**, agregar tu IP (o `0.0.0.0/0` para desarrollo)
5. En **Connect > Drivers**, copiar el connection string
6. Pegarlo en tu `.env` reemplazando `<password>` con tu password:

```
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@tu-cluster.mongodb.net/clase-sesiones
```

### 5. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (reinicia automaticamente al guardar cambios):

```bash
npm run dev
```

Si todo salio bien, vas a ver en la terminal:

```
Conectado a MongoDB - base de datos: clase-sesiones
Servidor corriendo en http://localhost:3000
Session store: memory
Entorno: development
```

## Estructura del proyecto

```
clase-2-sesiones/
├── config/
│   ├── database.js          # Conexion a MongoDB
│   └── session.js           # Configuracion de express-session y stores
├── middlewares/
│   ├── auth.middleware.js    # Middleware isAuthenticated
│   └── role.middleware.js    # Middleware hasRole (autorizacion por rol)
├── routes/
│   ├── auth.routes.js       # Registro, login y logout
│   └── protected.routes.js  # Rutas protegidas (/products, /admin)
├── .env.example             # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── postman_collection.json  # Coleccion de Postman lista para importar
├── server.js                # Punto de entrada de la aplicacion
└── README.md
```

## Endpoints

| Metodo | Ruta | Descripcion | Proteccion |
|---|---|---|---|
| GET | `/` | Healthcheck del servidor | Ninguna |
| POST | `/api/auth/register` | Registrar un usuario nuevo | Ninguna |
| POST | `/api/auth/login` | Iniciar sesion | Ninguna |
| POST | `/api/auth/logout` | Cerrar sesion | Ninguna |
| GET | `/api/products` | Listar productos | Requiere sesion |
| GET | `/api/admin` | Panel de administracion | Requiere sesion + rol `admin` |

### Ejemplos de request body

**Registrar usuario:**
```json
POST /api/auth/register
{
  "username": "juan",
  "password": "123456"
}
```

**Registrar admin:**
```json
POST /api/auth/register
{
  "username": "admin",
  "password": "123456",
  "role": "admin"
}
```

**Login:**
```json
POST /api/auth/login
{
  "username": "juan",
  "password": "123456"
}
```

## Probar con Postman

1. Abrir Postman
2. Ir a **File > Import** e importar el archivo `postman_collection.json`
3. Ejecutar los requests en este orden:
   - **Register** - Crear un usuario
   - **Login** - Iniciar sesion (esto genera la cookie de sesion)
   - **Products** - Acceder a ruta protegida (funciona porque ya tenes sesion)
   - **Admin** - Probar acceso de admin (va a fallar si el usuario no tiene rol `admin`)
   - **Logout** - Cerrar sesion
   - **Products** - Intentar de nuevo (va a fallar porque ya no hay sesion)

> **Tip:** Postman maneja las cookies automaticamente. Despues del login, la cookie `connect.sid` se envia en cada request.

## Tipos de Session Store

El proyecto soporta 3 formas de almacenar las sesiones. Se configura con la variable `SESSION_STORE` en el `.env`:

| Store | Variable | Descripcion | Uso recomendado |
|---|---|---|---|
| **Memory** | `SESSION_STORE=memory` | Se guarda en la RAM del servidor | Solo desarrollo. Se pierden al reiniciar |
| **File** | `SESSION_STORE=file` | Se guarda en archivos JSON en `./sessions/` | Desarrollo. Persisten al reiniciar |
| **MongoDB** | `SESSION_STORE=mongo` | Se guarda en MongoDB (coleccion `sessions`) | Produccion. Persisten y escalan |

## Troubleshooting

| Problema | Solucion |
|---|---|
| `MONGODB_URI no esta definida` | Asegurate de tener el archivo `.env` con la variable `MONGODB_URI` |
| `No se pudo conectar a MongoDB` | Verifica que tu IP este habilitada en Atlas y que usuario/password sean correctos |
| `Cannot find module 'xxx'` | Ejecuta `npm install` para instalar las dependencias |
| Las rutas protegidas devuelven 401 | Tenes que hacer login primero. Si usas Postman, verifica que las cookies esten habilitadas |
| El servidor no reinicia con los cambios | Usa `npm run dev` en vez de `npm start` |

## Tecnologias utilizadas

- [Express](https://expressjs.com/) - Framework web
- [express-session](https://www.npmjs.com/package/express-session) - Manejo de sesiones
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Hashing de passwords
- [connect-mongo](https://www.npmjs.com/package/connect-mongo) - Session store en MongoDB
- [session-file-store](https://www.npmjs.com/package/session-file-store) - Session store en archivos
- [dotenv](https://www.npmjs.com/package/dotenv) - Variables de entorno
