# Clase 2: Autenticación con sesiones, storage y rutas protegidas

## Guion de live coding para el docente

---

## 1. Objetivos de aprendizaje

Al finalizar esta clase, el alumno va a poder:

- Explicar qué es una sesión y por qué existe en el contexto de HTTP
- Diferenciar entre cookie y sesión
- Diferenciar entre autenticación y autorización
- Implementar registro y login con bcrypt en Express
- Configurar express-session con distintos stores (memory, file, mongo)
- Crear middlewares de autenticación y autorización por rol
- Proteger rutas con middlewares encadenados
- Probar un flujo completo de auth con Postman

---

## 2. Introducción para el docente (speech de apertura)

> "Hoy vamos a construir algo que todos usan todos los días pero pocos entienden: el sistema que hace que un sitio web 'se acuerde' de que ya te logueaste. Cada vez que entrás a Instagram, a Mercado Libre, a cualquier app, y no te pide la contraseña de nuevo... eso es una sesión.
>
> HTTP, el protocolo con el que funciona la web, no tiene memoria. Cada request que tu navegador manda al servidor es como si fuera la primera vez. Entonces, ¿cómo hace el servidor para saber que vos sos vos? Eso es exactamente lo que vamos a construir hoy desde cero. Vamos a armar un servidor con Express que tenga registro, login, logout, rutas que solo puedas ver si estás logueado, y rutas que solo puedas ver si sos admin. Y de paso vamos a ver dónde se guardan las sesiones y por qué eso importa."

---

## 3. Plan de la clase por bloques

| Bloque | Contenido | Tiempo estimado |
|---|---|---|
| 1 | Introducción conceptual: HTTP stateless, cookies, sesiones | 15 min |
| 2 | Setup del proyecto: estructura, dependencias, .env, server básico | 15 min |
| 3 | Base de datos en memoria y registro con bcrypt | 20 min |
| 4 | Login: crear la sesión | 15 min |
| 5 | Middleware isAuthenticated y ruta protegida | 20 min |
| 6 | Middleware hasRole y ruta de admin | 15 min |
| 7 | Logout: destruir sesión y limpiar cookie | 10 min |
| 8 | Session stores: memory vs file vs mongo | 15 min |
| 9 | Pruebas completas en Postman | 15 min |
| 10 | Cierre: resumen, simplificaciones, qué falta para producción | 10 min |
| | **Total estimado** | **~2h 30min** |

---

## 4. Guion completo de live coding

---

### BLOQUE 1: Introducción conceptual (15 min)

**Objetivo pedagógico:** Que el alumno entienda POR QUÉ existen las sesiones antes de escribir una sola línea de código.

**No se escribe código en este bloque.** Es pizarrón/slides/charla.

**Qué decir en voz alta:**

> "Antes de codear, necesito que entiendan un problema fundamental. HTTP es stateless. ¿Qué significa eso? Que cada request que el navegador le manda al servidor es independiente. El servidor no tiene idea de quién sos. Es como si cada vez que entrás a un local te atendiera un vendedor con amnesia total."

Dibujar o mostrar este diagrama mental:

```
Cliente                          Servidor
  |                                 |
  |--- POST /login (user, pass) -->|  "Ah, sos Juan, ok"
  |<-- 200 OK, acá tenés datos ----|
  |                                 |
  |--- GET /products -------------->|  "¿Y vos quién sos?" ← ESTE ES EL PROBLEMA
  |<-- 401 No autorizado -----------|
```

> "El servidor no se acuerda del request anterior. Entonces necesitamos un mecanismo para que el servidor 'recuerde' que ya te logueaste. Ese mecanismo son las sesiones."

**Explicar estos conceptos:**

**Cookie vs Sesión:**
> "Una cookie es un dato que el servidor le manda al navegador, y el navegador lo reenvía automáticamente en cada request. Es como un carnet de socio. La sesión son los datos que el servidor guarda asociados a ese carnet. La cookie dice 'soy el socio 42', y el servidor busca en su registro qué datos tiene del socio 42."

**Autenticación vs Autorización:**
> "Autenticación es verificar quién sos: '¿sos realmente Juan?'. Autorización es verificar qué podés hacer: '¿Juan tiene permiso para entrar al panel de admin?'. Primero se autentica, después se autoriza. Siempre en ese orden."

**Errores comunes de los alumnos en este bloque:**
- Confundir cookie con sesión (creer que son lo mismo)
- Creer que el navegador "se conecta" al servidor y queda conectado
- No entender por qué HTTP no tiene estado

**Mini cierre del bloque:**
> "Entonces: HTTP no tiene memoria. Las sesiones le dan memoria. La cookie es el 'ticket' que viaja entre cliente y servidor. Los datos reales viven en el servidor. Ahora vamos a implementarlo."

---

### BLOQUE 2: Setup del proyecto (15 min)

**Objetivo pedagógico:** Que el alumno vea la estructura completa antes de empezar y entienda para qué sirve cada carpeta.

**Qué decir en voz alta:**

> "Vamos a arrancar creando el proyecto desde cero. Primero la estructura de carpetas, después instalamos las dependencias."

#### Paso 2.1: Crear el proyecto e instalar dependencias

```bash
mkdir clase-2-sesiones
cd clase-2-sesiones
npm init -y
npm install express express-session bcrypt dotenv session-file-store connect-mongo
```

**Qué decir mientras se ejecuta:**

> "Fíjense las dependencias:
> - **express** ya lo conocen.
> - **express-session** es el middleware que maneja las sesiones.
> - **bcrypt** es para hashear contraseñas. Nunca, nunca, nunca guardamos contraseñas en texto plano.
> - **dotenv** para leer variables de entorno desde un archivo .env.
> - **session-file-store** y **connect-mongo** son dos formas alternativas de guardar las sesiones. Ya vamos a ver para qué."

#### Paso 2.2: Crear la estructura de carpetas

```bash
mkdir config routes middlewares data
```

**Mostrar la estructura final esperada:**

```
clase-2-sesiones/
├── config/
│   └── session.js          ← configuración de sesiones
├── data/
│   └── users.js            ← "base de datos" en memoria
├── middlewares/
│   ├── auth.middleware.js   ← ¿estás logueado?
│   └── role.middleware.js   ← ¿tenés el rol correcto?
├── routes/
│   ├── auth.routes.js       ← register, login, logout
│   └── protected.routes.js  ← productos, admin
├── .env
├── .gitignore
├── package.json
└── server.js                ← punto de entrada
```

> "Cada cosa en su lugar. Las rutas en routes, los middlewares en middlewares, la config en config. Esto no es capricho: es para que cuando el proyecto crezca, sepas dónde está cada cosa."

#### Paso 2.3: Crear el archivo .env

**Archivo: `.env`**

```env
PORT=3000
SESSION_SECRET=mi_secreto_super_seguro
NODE_ENV=development
SESSION_STORE=memory
MONGODB_URI=mongodb://localhost:27017/clase-sesiones
```

**Qué decir:**

> "El .env es un archivo que NO se sube a git. Acá van las cosas que cambian entre entornos: el puerto, los secretos, la conexión a la base de datos. Usamos dotenv para leerlo."

**Crear también `.gitignore`:**

```
node_modules/
.env
sessions/
```

> "Tres cosas que nunca se suben a git: node_modules porque pesa mucho, .env porque tiene secretos, y sessions porque son datos temporales del servidor."

#### Paso 2.4: Crear server.js mínimo

**Archivo: `server.js`** — VERSIÓN INICIAL (no la final)

```js
require('dotenv').config();

const express = require('express');

const app = express();

// Parsear JSON del body
app.use(express.json());

// Healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

**Qué decir:**

> "Arrancamos con lo mínimo. Un servidor que responde un JSON en la raíz. Esto nos sirve como healthcheck: si pego en localhost:3000 y me responde, sé que el servidor está vivo."

**Probar:**

```bash
node server.js
# En otra terminal o Postman: GET http://localhost:3000/
```

> "Perfecto, anda. Ahora vamos a agregarle cosas paso a paso."

**Errores comunes:**
- Olvidar `require('dotenv').config()` → las variables de entorno quedan undefined
- Olvidar `express.json()` → req.body es undefined al hacer POST
- No tener el .env en la raíz del proyecto

**Mini cierre:**
> "Ya tenemos un servidor Express andando con variables de entorno. Este es nuestro punto de partida. Todo lo que sigue se construye sobre esto."

---

### BLOQUE 3: Base de datos en memoria y registro con bcrypt (20 min)

**Objetivo pedagógico:** Que el alumno entienda cómo se guarda un usuario de forma segura y por qué nunca se guarda la contraseña en texto plano.

#### Paso 3.1: Crear la "base de datos" en memoria

**Archivo: `data/users.js`**

```js
const users = [];

module.exports = users;
```

**Qué decir:**

> "En un proyecto real esto sería MongoDB, PostgreSQL, lo que sea. Pero hoy queremos enfocarnos en las sesiones, así que vamos a usar un simple array de JavaScript. Ojo: cada vez que reinicien el servidor, este array se vacía. Los datos viven solo en la RAM."

> "¿Por qué hacemos esto? Porque si mezclo la enseñanza de sesiones con la enseñanza de base de datos, no van a aprender bien ninguna de las dos cosas. Simplifiquemos."

#### Paso 3.2: Crear la ruta de registro

**Archivo: `routes/auth.routes.js`** — solo el register por ahora

```js
const { Router } = require('express');
const bcrypt = require('bcrypt');
const users = require('../data/users');

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos.' });
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe.' });
    }

    // Hashear el password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role || 'user',
    };

    users.push(newUser);

    // Responder SIN el password
    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
```

**Qué decir mientras se escribe, línea por línea:**

Cuando se llega a `bcrypt.hash(password, 10)`:

> "Acá pasa algo muy importante. Estamos usando bcrypt para hashear la contraseña. ¿Qué significa hashear? Es una transformación de un solo sentido. Vos podés convertir '123456' en un hash, pero no podés convertir el hash de vuelta en '123456'. Es como pasar carne por una picadora: podés hacer carne picada, pero no podés reconstruir el bife."

> "El número 10 son los 'salt rounds'. Es cuántas vueltas de procesamiento se hacen. Más vueltas, más seguro, pero más lento. 10 es un buen balance."

> "¿Por qué no guardamos la contraseña en texto plano? Porque si alguien accede a tu base de datos (y pasa más seguido de lo que creen), no quieren encontrar las contraseñas de todos tus usuarios ahí servidas. Con el hash, aunque vean los datos, no pueden saber las contraseñas originales."

Cuando se llega a la respuesta:

> "Fíjense que en la respuesta NO devolvemos el password. Ni el hash. El password no sale del servidor nunca más. Esta es una buena práctica de seguridad que tienen que tener siempre."

#### Paso 3.3: Conectar la ruta al servidor

**Archivo: `server.js`** — agregar estas líneas

```js
const authRoutes = require('./routes/auth.routes');

// ... después de app.use(express.json())

app.use('/api/auth', authRoutes);
```

**Qué decir:**

> "Con `app.use('/api/auth', authRoutes)` estamos diciendo: 'todo lo que esté definido en auth.routes.js, montalo bajo /api/auth'. Entonces el router.post('/register') se convierte en POST /api/auth/register."

**Probar en Postman:**

```
POST http://localhost:3000/api/auth/register
Body (JSON): { "username": "juan", "password": "123456" }
```

> "Debería devolvernos un 201 con el usuario creado. Fíjense que no aparece el password en la respuesta."

**Errores comunes:**
- Olvidar el `async` en el handler (bcrypt.hash es asíncrono)
- No poner `express.json()` y que req.body sea undefined
- Confundir el 10 de bcrypt con el largo del password
- Intentar registrar el mismo usuario dos veces y no entender el 409

**Mini cierre:**
> "Ya podemos registrar usuarios. Las contraseñas se guardan hasheadas. Ahora necesitamos poder loguearnos."

---

### BLOQUE 4: Login — crear la sesión (15 min)

**Objetivo pedagógico:** Que el alumno entienda el momento exacto donde "nace" una sesión y qué se guarda en ella.

#### Paso 4.1: Configurar express-session

**Antes de crear el login**, necesitamos configurar las sesiones. Empezamos con la versión más simple (solo memory).

**Archivo: `config/session.js`** — VERSIÓN SIMPLIFICADA INICIAL

```js
const session = require('express-session');

function createSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || 'secreto_por_defecto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60, // 1 hora
    },
  });
}

module.exports = createSessionMiddleware;
```

**Qué decir mientras se escribe:**

> "Vamos a configurar express-session. Este middleware es el que se encarga de todo el manejo de sesiones. Le pasamos un objeto de configuración."

Cuando se escribe `secret`:

> "El **secret** es una cadena que se usa para firmar la cookie de sesión. ¿Qué significa firmar? Que el servidor agrega una especie de 'sello' a la cookie. Si alguien modifica la cookie manualmente, el sello no va a coincidir y el servidor la rechaza. Es como un sello de lacre en una carta."

Cuando se escribe `resave: false`:

> "**resave: false** significa que no vuelva a guardar la sesión en el store si no se modificó. Si el usuario hace un request y no cambió nada de su sesión, no tiene sentido volver a escribirla. Ahorra operaciones."

Cuando se escribe `saveUninitialized: false`:

> "**saveUninitialized: false** significa que no guarde sesiones vacías. Si un usuario visita la página sin loguearse, no queremos crear una sesión para él. Solo creamos sesiones cuando las necesitamos."

Cuando se escribe la cookie:

> "La cookie es lo que le mandamos al navegador. **httpOnly: true** significa que JavaScript del navegador no puede leer esta cookie. ¿Para qué? Para prevenir ataques XSS. Si alguien inyecta un script malicioso en tu página, no va a poder robar la cookie de sesión."

> "**secure** lo ponemos true solo en producción, porque en producción usamos HTTPS. En desarrollo usamos HTTP, y si ponemos secure: true, la cookie no se envía y nada funciona."

#### Paso 4.2: Agregar el middleware al servidor

**Archivo: `server.js`** — agregar

```js
const createSessionMiddleware = require('./config/session');

// ... después de app.use(express.json())
app.use(createSessionMiddleware());
```

> "A partir de esta línea, cada request que llega al servidor tiene disponible `req.session`. Todavía está vacío, pero está disponible."

#### Paso 4.3: Crear el endpoint de login

**Archivo: `routes/auth.routes.js`** — agregar después del register

```js
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos.' });
    }

    // Buscar al usuario
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Comparar passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // ✅ Guardar datos en la sesión
    req.session.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    return res.json({
      message: 'Login exitoso.',
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
```

**Qué decir — este es el momento clave de la clase:**

Cuando se llega a `bcrypt.compare`:

> "Acá usamos `bcrypt.compare()`. Le pasamos el password que el usuario envió y el hash que guardamos. bcrypt internamente hashea el password con el mismo salt que usó al registrar, y compara los dos hashes. Si coinciden, el password es correcto."

> "Fíjense que damos el mismo error 'Credenciales inválidas' cuando no existe el usuario Y cuando el password es incorrecto. ¿Por qué? Por seguridad. Si dijéramos 'usuario no encontrado' vs 'password incorrecto', un atacante podría deducir qué usernames existen en el sistema."

Cuando se llega a `req.session.user = { ... }`:

> "**ESTA es la línea más importante de toda la clase.** Acá es donde nace la sesión. Al asignar datos a `req.session.user`, express-session automáticamente:
> 1. Genera un ID único de sesión
> 2. Guarda estos datos en el store (en memoria, por ahora)
> 3. Le manda una cookie al cliente con ese ID
>
> A partir de ahora, cada vez que este cliente haga un request, va a enviar esa cookie. El servidor la lee, busca la sesión por ID, y ya sabe quién es."

> "Fíjense qué guardamos: userId, username y role. NO guardamos el password. En la sesión solo va lo que necesitamos para identificar al usuario y saber qué permisos tiene."

**Probar en Postman:**

```
POST http://localhost:3000/api/auth/login
Body (JSON): { "username": "juan", "password": "123456" }
```

> "Miren la respuesta. Dice 'Login exitoso'. Pero lo más importante está en las headers de respuesta: ahí hay un `Set-Cookie` con algo como `connect.sid=s%3Axxxxx`. Esa es la cookie de sesión. Postman la guarda automáticamente."

**Errores comunes:**
- No tener el middleware de sesiones antes de las rutas → req.session no existe
- Confundir `bcrypt.hash` (para guardar) con `bcrypt.compare` (para verificar)
- Olvidar que bcrypt.compare es asíncrono
- No entender que la sesión "viaja" en una cookie, no en el body

**Mini cierre:**
> "Ya tenemos register y login. El usuario se puede registrar, loguearse, y el servidor le manda una cookie que dice 'ya te conozco'. Ahora viene la parte interesante: ¿cómo protegemos rutas?"

---

### BLOQUE 5: Middleware isAuthenticated y ruta protegida (20 min)

**Objetivo pedagógico:** Que el alumno entienda el patrón de middleware como "guardia" de rutas, y la diferencia entre 401 y 403.

#### Paso 5.1: Crear el middleware de autenticación

**Archivo: `middlewares/auth.middleware.js`**

```js
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({
    error: 'No autorizado. Debes iniciar sesión primero.',
  });
}

module.exports = { isAuthenticated };
```

**Qué decir — explicar con la analogía del guardia:**

> "Un middleware es una función que se ejecuta ANTES de que el request llegue a la ruta final. Piensen en un boliche con un patovica en la puerta. El patovica revisa si estás en la lista. Si estás, te deja pasar (`next()`). Si no estás, te frena (`res.status(401)`)."

> "Lo que estamos chequeando es simple: ¿existe `req.session.user`? Si existe, es porque en algún momento el usuario hizo login y nosotros guardamos sus datos ahí. Si no existe, nunca se logueó o su sesión expiró."

> "El 401 significa 'Unauthorized': no sabemos quién sos. No es que no tengas permiso, es que directamente no te identificaste."

> "Fíjense que la función recibe `(req, res, next)`. Los tres parámetros del middleware. Si no llamamos a `next()`, el request se queda ahí, nunca llega a la ruta. Es como una cadena: si un eslabón se corta, no pasa."

#### Paso 5.2: Crear la ruta protegida de productos

**Archivo: `routes/protected.routes.js`**

```js
const { Router } = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/products', isAuthenticated, (req, res) => {
  const productos = [
    { id: 1, nombre: 'Laptop', precio: 999 },
    { id: 2, nombre: 'Mouse', precio: 25 },
    { id: 3, nombre: 'Teclado', precio: 75 },
  ];

  return res.json({
    message: `Hola ${req.session.user.username}, acá están los productos.`,
    productos,
  });
});

module.exports = router;
```

**Qué decir:**

> "Miren cómo se usa el middleware: `router.get('/products', isAuthenticated, (req, res) => { ... })`. El middleware `isAuthenticated` va en el MEDIO, entre la ruta y el handler. Express los ejecuta en orden: primero isAuthenticated, y si llama a next(), después el handler."

> "Si el usuario no está logueado, isAuthenticated devuelve 401 y el handler de productos NUNCA se ejecuta. Es elegante: la ruta ni se entera de que existió un request no autorizado."

> "También fíjense que usamos `req.session.user.username` en la respuesta. Como sabemos que el usuario pasó por isAuthenticated, podemos confiar en que req.session.user existe."

#### Paso 5.3: Conectar al servidor

**Archivo: `server.js`** — agregar

```js
const protectedRoutes = require('./routes/protected.routes');

app.use('/api', protectedRoutes);
```

#### Paso 5.4: Probar — este es un momento clave para la demo

**Qué decir:**

> "Ahora viene la prueba de fuego. Vamos a Postman."

**Demo 1: Sin sesión**

```
GET http://localhost:3000/api/products
→ 401: "No autorizado. Debes iniciar sesión primero."
```

> "Sin cookie, no hay sesión, no hay acceso. Así tiene que ser."

**Demo 2: Con sesión (después de login)**

```
POST http://localhost:3000/api/auth/login → login exitoso
GET http://localhost:3000/api/products → 200 con productos
```

> "Ahora sí. Postman guardó la cookie del login y la envió automáticamente en el segundo request. El servidor leyó la cookie, encontró la sesión, vio que tenía datos en .user, y dejó pasar."

**Errores comunes:**
- Probar en Postman pero en pestañas separadas sin compartir cookies → no funciona
- Olvidar poner isAuthenticated en la ruta → la ruta queda pública
- Poner isAuthenticated DESPUÉS del handler en vez de antes
- No entender la diferencia entre 401 (quién sos) y 403 (qué podés hacer)

**Mini cierre:**
> "Ya tenemos una ruta protegida. Solo los usuarios logueados pueden ver los productos. Pero... ¿qué pasa si queremos que solo los ADMIN puedan acceder a ciertas rutas? Para eso necesitamos otro middleware."

---

### BLOQUE 6: Middleware hasRole y ruta de admin (15 min)

**Objetivo pedagógico:** Que el alumno entienda la diferencia entre autenticación y autorización, y el patrón de higher-order function para middlewares parametrizados.

#### Paso 6.1: Crear el middleware de rol

**Archivo: `middlewares/role.middleware.js`**

```js
function hasRole(role) {
  return (req, res, next) => {
    const userRole = req.session.user.role;

    if (userRole === role) {
      return next();
    }

    return res.status(403).json({
      error: `Acceso denegado. Se requiere rol "${role}", pero tu rol es "${userRole}".`,
    });
  };
}

module.exports = { hasRole };
```

**Qué decir — este concepto suele costar:**

> "Acá hay algo nuevo: `hasRole` no ES un middleware, sino que DEVUELVE un middleware. Es una función que genera funciones. ¿Por qué? Porque necesitamos que el middleware sea configurable."

> "Si yo escribiera un middleware fijo `isAdmin`, solo serviría para admins. Pero con `hasRole('admin')`, `hasRole('editor')`, `hasRole('moderator')`, puedo reutilizar la misma lógica para cualquier rol. La función `hasRole` recibe el rol como parámetro y genera un middleware específico para ese rol."

> "Esto se llama 'higher-order function': una función que retorna otra función. Es un patrón que van a ver mucho en JavaScript."

> "Y fíjense el status code: **403 Forbidden**. No es 401. La diferencia es importante: 401 dice 'no sé quién sos' (autenticación). 403 dice 'sé quién sos pero no tenés permiso' (autorización). Si te piden diferenciar autenticación de autorización en una entrevista, 401 vs 403 es la respuesta corta."

#### Paso 6.2: Crear la ruta de admin

**Archivo: `routes/protected.routes.js`** — agregar

```js
const { hasRole } = require('../middlewares/role.middleware');

router.get('/admin', isAuthenticated, hasRole('admin'), (req, res) => {
  return res.json({
    message: 'Bienvenido al panel de administración.',
    user: req.session.user,
    secreto: 'Esta info solo la ven los admins 🔐',
  });
});
```

**Qué decir:**

> "Miren la cadena de middlewares: `isAuthenticated, hasRole('admin')`. Se ejecutan en orden:
> 1. Primero: ¿estás logueado? Si no → 401.
> 2. Después: ¿sos admin? Si no → 403.
> 3. Si pasaste los dos → llegás al handler.
>
> Es como un aeropuerto: primero mostrás el pasaporte (autenticación), después pasan tu equipaje por el scanner (autorización). No podés saltear pasos."

#### Paso 6.3: Probar en Postman

**Demo: usuario normal intenta acceder a admin**

```
POST /api/auth/register → { "username": "juan", "password": "123456" }
POST /api/auth/login → login exitoso (rol: user)
GET /api/admin → 403: Se requiere rol "admin", pero tu rol es "user"
```

> "Juan está logueado, pero no es admin. El middleware lo frena."

**Demo: registrar y loguear un admin**

```
POST /api/auth/register → { "username": "admin", "password": "admin123", "role": "admin" }
POST /api/auth/login → login exitoso (rol: admin)
GET /api/admin → 200: "Bienvenido al panel de administración."
```

> "Ahora sí. El admin pasa los dos middlewares."

**Errores comunes:**
- Poner `hasRole('admin')` ANTES de `isAuthenticated` → explota porque req.session.user no existe todavía
- Olvidar el `return` en `next()` o en `res.status()`
- No entender la diferencia entre 401 y 403
- Confundir la función hasRole (que genera middleware) con el middleware en sí

**Mini cierre:**
> "Ya tenemos autenticación Y autorización. Rutas protegidas por sesión y rutas protegidas por rol. Ahora nos falta poder cerrar la sesión."

---

### BLOQUE 7: Logout — destruir la sesión (10 min)

**Objetivo pedagógico:** Que el alumno entienda que el logout es un proceso doble: destruir los datos del servidor Y limpiar la cookie del cliente.

#### Paso 7.1: Agregar el endpoint de logout

**Archivo: `routes/auth.routes.js`** — agregar

```js
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión.' });
    }

    res.clearCookie('connect.sid');

    return res.json({ message: 'Sesión cerrada exitosamente.' });
  });
});
```

**Qué decir:**

> "El logout hace dos cosas. Primera: `req.session.destroy()` elimina la sesión del servidor. Ya no existe más en el store. Segunda: `res.clearCookie('connect.sid')` le dice al navegador que borre la cookie."

> "¿Por qué las dos cosas? Porque si solo destruís la sesión del servidor pero el cliente conserva la cookie, en el próximo request va a mandar una cookie que apunta a una sesión que ya no existe. Funcionaría igual (el servidor no la encuentra y la trata como no logueado), pero es más limpio borrar las dos."

> "`connect.sid` es el nombre por defecto de la cookie que usa express-session. Si lo cambiaron en la config, tienen que usar ese nombre acá."

**Probar en Postman:**

```
POST /api/auth/login → login exitoso
GET /api/products → 200 con productos
POST /api/auth/logout → "Sesión cerrada exitosamente."
GET /api/products → 401 "No autorizado"
```

> "Después del logout, el mismo request a /products que antes funcionaba ahora devuelve 401. La sesión ya no existe."

**Errores comunes:**
- Intentar usar `req.session` después de `destroy()` → ya no existe
- Olvidar `clearCookie` → la cookie queda en el navegador como basura
- Escribir mal 'connect.sid'

**Mini cierre:**
> "Flujo completo funcionando: register → login → acceder a rutas protegidas → logout → acceso denegado. Ahora la pregunta es: ¿dónde se guardan estas sesiones?"

---

### BLOQUE 8: Session stores — memory, file, mongo (15 min)

**Objetivo pedagógico:** Que el alumno entienda que las sesiones necesitan persistencia y que hay distintas estrategias según el contexto.

**Qué decir para abrir el bloque:**

> "Hasta ahora las sesiones se guardan en la RAM del proceso de Node. ¿Qué pasa si reinicio el servidor?"

**Demo en vivo:**

```
1. Login → funciona
2. GET /products → funciona
3. Reiniciar el servidor (Ctrl+C → node server.js)
4. GET /products → 401 ❌
```

> "Boom. Se perdió todo. ¿Por qué? Porque MemoryStore vive en la RAM del proceso. Cuando el proceso muere, todo muere con él. En desarrollo no importa, pero en producción necesitamos que las sesiones sobrevivan a un reinicio."

#### Orden recomendado para mostrar los stores

**1. Memory (ya lo vimos)** — el default, lo que viene "gratis"

> "MemoryStore es el default. No hace falta instalar nada ni configurar nada. Pero tiene tres problemas graves para producción:
> - Se pierde al reiniciar
> - No escala: si tenés 2 servidores, cada uno tiene su propia memoria
> - Consume RAM: con muchas sesiones, el proceso se hincha"

**2. File (session-file-store)** — segundo, porque es visual e intuitivo

> "Vamos a cambiar a file store para que vean algo concreto."

**Archivo: `config/session.js`** — ahora sí la versión completa con el switch

```js
const session = require('express-session');

function getStore() {
  const storeType = process.env.SESSION_STORE || 'memory';

  switch (storeType) {
    case 'file': {
      const FileStore = require('session-file-store')(session);
      console.log('📁 Usando session-file-store (archivos en disco)');
      return new FileStore({
        path: './sessions',
        ttl: 3600,
      });
    }

    case 'mongo': {
      const MongoStore = require('connect-mongo');
      console.log('🍃 Usando connect-mongo (MongoDB)');
      return MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/clase-sesiones',
        ttl: 3600,
      });
    }

    case 'memory':
    default:
      console.log('🧠 Usando MemoryStore (RAM - solo para desarrollo)');
      return undefined;
  }
}

function createSessionMiddleware() {
  const store = getStore();

  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secreto_por_defecto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    },
  };

  if (store) {
    sessionConfig.store = store;
  }

  return session(sessionConfig);
}

module.exports = createSessionMiddleware;
```

**Qué decir mientras se escribe:**

> "Ahora la configuración de sesiones lee la variable `SESSION_STORE` del .env y elige el store correspondiente. Es un switch simple. Esto nos permite cambiar de store sin tocar código: solo cambiamos la variable de entorno."

**Demo con file store:**

Cambiar en `.env`: `SESSION_STORE=file`

```bash
node server.js
# → "📁 Usando session-file-store (archivos en disco)"
```

```
POST /api/auth/login → login exitoso
```

> "Ahora miren la carpeta del proyecto."

```bash
ls sessions/
# → aparece un archivo .json con la sesión
```

> "¡Ahí está! Un archivo JSON con los datos de la sesión. Pueden abrirlo y ver exactamente qué hay adentro."

**Abrir el archivo de sesión y mostrarlo:**

> "Ven: ahí está userId, username, role, y los metadatos de la sesión. Esto es lo que el servidor consulta cada vez que llega un request con esa cookie."

**Demo de persistencia:**

```
1. Login → funciona
2. Reiniciar servidor
3. GET /products → ¡SIGUE FUNCIONANDO! ✅
```

> "Ahora la sesión sobrevivió al reinicio. Porque no vive en la RAM, vive en un archivo en disco."

**3. Mongo (connect-mongo)** — tercero, porque es lo que se usa en producción pero requiere tener MongoDB corriendo

> "El file store está bien para desarrollo, pero en producción queremos algo más robusto. Si tienen MongoDB corriendo, podemos usar connect-mongo."

Cambiar en `.env`: `SESSION_STORE=mongo`

> "Si no tienen MongoDB instalado, no pasa nada, la idea es que entiendan que es la misma lógica: cambiar dónde se guardan las sesiones. En producción, connect-mongo es la opción recomendada si ya usan MongoDB, porque las sesiones quedan en la misma base de datos, con TTL automático que las limpia cuando expiran."

**¿Por qué este orden?**

> "Mostramos memory primero porque es el default y el más fácil de entender. File segundo porque es visual: pueden abrir el archivo y ver la sesión. Mongo último porque ya es producción y requiere infraestructura. Cada paso agrega una capa de complejidad."

**Errores comunes:**
- Cambiar SESSION_STORE pero no reiniciar el servidor
- No tener MongoDB corriendo e intentar usar el store mongo → error de conexión
- No entender que `sessions/` es una carpeta nueva que aparece con file store

**Mini cierre:**
> "Las sesiones son datos que hay que guardar en algún lado. En desarrollo usen memory. Si quieren persistencia local, file. En producción con MongoDB, connect-mongo. Lo importante es que el código de las rutas y los middlewares NO cambia. Solo cambia dónde se guardan los datos."

---

### BLOQUE 9: Pruebas completas en Postman (15 min)

**Objetivo pedagógico:** Que el alumno pueda verificar el flujo completo de auth y entienda qué esperar en cada paso.

**Qué decir:**

> "Vamos a hacer el recorrido completo como lo haría un usuario real. Importamos la colección de Postman que ya está en el proyecto."

**Importar `postman_collection.json` en Postman.**

> "Importante en Postman: vayan a Settings y asegúrense de que 'Automatically follow redirects' esté activado y que las cookies estén habilitadas. Postman maneja cookies automáticamente, pero a veces hay que verificarlo."

#### Prueba 1: Healthcheck

```
GET http://localhost:3000/
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Servidor funcionando correctamente.",
  "sessionStore": "memory"
}
```

> "Esto confirma que el servidor está vivo y nos dice qué store estamos usando."

#### Prueba 2: Registrar un usuario normal

```
POST http://localhost:3000/api/auth/register
Body: { "username": "juan", "password": "123456" }
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente.",
  "user": { "id": 1, "username": "juan", "role": "user" }
}
```

> "Registrado. Fíjense que el rol es 'user' por defecto y que el password NO aparece en la respuesta."

#### Prueba 3: Registrar un admin

```
POST http://localhost:3000/api/auth/register
Body: { "username": "admin", "password": "admin123", "role": "admin" }
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente.",
  "user": { "id": 2, "username": "admin", "role": "admin" }
}
```

> "En la vida real no dejarían que cualquiera se registre como admin. Esto es una simplificación para la demo."

#### Prueba 4: Intentar acceder a productos sin loguearse

```
GET http://localhost:3000/api/products
```

**Respuesta esperada (401):**
```json
{
  "error": "No autorizado. Debes iniciar sesión primero."
}
```

> "401. No hay sesión. El middleware isAuthenticated hizo su trabajo."

#### Prueba 5: Login como usuario normal

```
POST http://localhost:3000/api/auth/login
Body: { "username": "juan", "password": "123456" }
```

**Respuesta esperada (200):**
```json
{
  "message": "Login exitoso.",
  "user": { "userId": 1, "username": "juan", "role": "user" }
}
```

> "Login exitoso. Postman ahora tiene la cookie `connect.sid` guardada. La pueden ver en la pestaña Cookies."

#### Prueba 6: Acceder a productos (ahora sí logueado)

```
GET http://localhost:3000/api/products
```

**Respuesta esperada (200):**
```json
{
  "message": "Hola juan, acá están los productos.",
  "productos": [
    { "id": 1, "nombre": "Laptop", "precio": 999 },
    { "id": 2, "nombre": "Mouse", "precio": 25 },
    { "id": 3, "nombre": "Teclado", "precio": 75 }
  ]
}
```

> "Ahora sí nos muestra los productos. Y nos saluda por nombre porque lee el username de la sesión."

#### Prueba 7: Intentar acceder a admin siendo usuario normal

```
GET http://localhost:3000/api/admin
```

**Respuesta esperada (403):**
```json
{
  "error": "Acceso denegado. Se requiere rol \"admin\", pero tu rol es \"user\"."
}
```

> "403, no 401. El servidor sabe quién somos (pasamos isAuthenticated), pero no tenemos el rol correcto (fallamos hasRole). Autenticación OK, autorización FAIL."

#### Prueba 8: Login como admin

```
POST http://localhost:3000/api/auth/login
Body: { "username": "admin", "password": "admin123" }
```

> "Ahora logueamos con el usuario admin. La sesión anterior se reemplaza."

#### Prueba 9: Acceder a admin siendo admin

```
GET http://localhost:3000/api/admin
```

**Respuesta esperada (200):**
```json
{
  "message": "Bienvenido al panel de administración.",
  "user": { "userId": 2, "username": "admin", "role": "admin" },
  "secreto": "Esta info solo la ven los admins 🔐"
}
```

> "Ahora sí. Autenticado + autorizado = acceso completo."

#### Prueba 10: Logout

```
POST http://localhost:3000/api/auth/logout
```

**Respuesta esperada (200):**
```json
{
  "message": "Sesión cerrada exitosamente."
}
```

#### Prueba 11: Intentar acceder después del logout

```
GET http://localhost:3000/api/products
```

**Respuesta esperada (401):**
```json
{
  "error": "No autorizado. Debes iniciar sesión primero."
}
```

> "Después del logout, volvemos al estado inicial. La sesión fue destruida y la cookie fue limpiada. Ciclo completo."

---

### BLOQUE 10: Cierre de clase (10 min)

**Objetivo pedagógico:** Consolidar lo aprendido y dar contexto de lo que falta para producción.

#### Resumen de lo aprendido

**Qué decir:**

> "Hagamos un repaso rápido de todo lo que construimos hoy:"

> "1. **HTTP es stateless.** Cada request es independiente. Las sesiones le dan memoria al servidor."

> "2. **Una sesión tiene dos partes:** la cookie que viaja en el cliente (solo tiene el ID) y los datos que viven en el servidor (tienen la info del usuario)."

> "3. **Registro con bcrypt:** las contraseñas se hashean antes de guardar. Nunca texto plano."

> "4. **Login crea la sesión:** `req.session.user = { ... }` es la línea donde nace todo."

> "5. **Middlewares como guardianes:** `isAuthenticated` verifica la sesión (401 si no hay), `hasRole` verifica el rol (403 si no coincide)."

> "6. **Los middlewares se encadenan:** primero autenticación, después autorización."

> "7. **Logout destruye la sesión** del servidor y limpia la cookie del cliente."

> "8. **Las sesiones se pueden guardar** en memoria, en archivos o en MongoDB. El código de las rutas no cambia."

#### Simplificaciones que hicimos

> "Esto es una demo educativa. En un proyecto real cambiarían varias cosas:"

> "- Los usuarios estarían en una base de datos real, no en un array."

> "- No dejaríamos que cualquiera se registre como admin."

> "- Agregaríamos rate limiting para prevenir ataques de fuerza bruta."

> "- Usaríamos HTTPS en producción (y secure: true en las cookies)."

> "- Probablemente evaluaríamos usar JWT en vez de sesiones para APIs (eso es la clase que viene)."

#### Qué faltaría para producción

> "Si quisieran llevar esto a producción, necesitarían al mínimo:
> - Base de datos real (MongoDB, PostgreSQL)
> - HTTPS
> - Rate limiting en login y register
> - Validación más robusta del input
> - Logging profesional
> - Tests automatizados
> - CORS configurado si el frontend está en otro dominio
> - Un session store persistente (connect-mongo, connect-redis)"

---

## 5. Explicaciones conceptuales — resumen de cuándo dar cada una

| Concepto | Momento de la clase | Bloque |
|---|---|---|
| HTTP es stateless | Apertura, antes de cualquier código | 1 |
| Cookie vs sesión | Apertura, con diagrama | 1 |
| Autenticación vs autorización | Apertura + refuerzo al ver 401 vs 403 | 1 y 6 |
| Por qué bcrypt | Al escribir el register | 3 |
| Por qué no guardar contraseñas en texto plano | Al escribir el register | 3 |
| Qué es `req.session` | Al configurar express-session | 4 |
| Cómo fluye la cookie | Al hacer login y ver Set-Cookie | 4 |
| Patrón middleware | Al crear isAuthenticated | 5 |
| Higher-order function | Al crear hasRole | 6 |
| 401 vs 403 | Al probar admin con usuario normal | 6 |
| Memory vs file vs mongo | Bloque dedicado después del flujo completo | 8 |
| Por qué memory no sirve para producción | Demo de reiniciar servidor y perder sesiones | 8 |

---

## 6. Orden recomendado para mostrar el storage

### 1. Memory (Bloque 2-7)

Usar durante toda la construcción del flujo de auth. Es el default y no requiere configuración extra. El alumno se enfoca en las sesiones sin distracciones.

### 2. File (Bloque 8, primera parte)

Mostrar DESPUÉS de que todo funcione con memory. La transición es poderosa: "miren, solo cambié una variable de entorno y ahora las sesiones están en archivos que pueden abrir". Es visual, tangible, y el alumno puede inspeccionar el JSON de la sesión.

### 3. Mongo (Bloque 8, segunda parte)

Mostrar último, solo si el grupo tiene MongoDB instalado. Si no, explicarlo conceptualmente. Es el store de producción y cierra la progresión: RAM → disco → base de datos.

**¿Por qué este orden?**

Porque sigue una progresión de complejidad: primero lo invisible (RAM), después lo visible (archivo JSON que podés abrir), después lo profesional (base de datos). Cada paso valida que el código de la aplicación NO cambia, solo cambia el almacenamiento. Esa es la lección más importante del bloque de stores.

---

## 7. Cierre docente

> "Hoy construimos un sistema de autenticación completo con sesiones. Es el patrón que usaron durante décadas aplicaciones como Facebook, Twitter, Amazon. Es elegante, simple, y ahora entienden cómo funciona por dentro. La próxima clase vamos a ver JWT, que es la alternativa moderna para APIs. Van a poder comparar los dos enfoques habiendo entendido primero el más fundamental."

---

## 8. Bonus: consejos para el live coding

### Ritmo

- **Escribir a velocidad normal del alumno.** No correr. Si vos tardás 30 segundos en escribir una función, el alumno tarda 2 minutos. Esperá.
- **Compilar/testear seguido.** No escribir 50 líneas sin probar. Cada paso debe terminar con un `node server.js` o una prueba en Postman. El feedback inmediato da confianza.
- **Si te equivocás, no borres rápido.** Dejá que los alumnos vean el error y cómo se corrige. Los errores en vivo son las mejores lecciones.

### Pausas para preguntas

Hacer pausa obligatoria después de:
- Bloque 1 (conceptual) → "¿Quedó clara la diferencia entre cookie y sesión?"
- Paso 3.2 (bcrypt) → "¿Alguna pregunta sobre el hashing?"
- Paso 4.3 (`req.session.user = ...`) → "¿Se entiende dónde nace la sesión?"
- Paso 5.4 (probar 401) → "¿Se ve por qué da 401?"
- Paso 6.3 (probar 403) → "¿Se entiende la diferencia entre 401 y 403?"
- Bloque 8 (stores) → "¿Dudas sobre los distintos stores?"

### Qué escribir en vivo vs qué pegar

| Escribir en vivo | Pegar/copiar |
|---|---|
| `data/users.js` (son 3 líneas) | El array de productos en protected.routes.js |
| `auth.middleware.js` (es clave) | Los imports al inicio de cada archivo |
| `role.middleware.js` (es clave) | La configuración del .env |
| El handler de `/register` | La colección de Postman |
| La línea `req.session.user = { ... }` | El switch completo de stores (config/session.js) |
| `req.session.destroy()` y `clearCookie` | |

**Regla general:** escribir en vivo todo lo que tenga valor pedagógico. Pegar lo que es mecánico o repetitivo.

### Cosas que aparecen en entrevistas y proyectos reales

Remarcar especialmente:

- **"¿Por qué no se guardan las contraseñas en texto plano?"** → Pregunta clásica de entrevista. La respuesta es bcrypt + salt.
- **"¿Cuál es la diferencia entre 401 y 403?"** → Pregunta frecuente. 401 = no autenticado. 403 = no autorizado.
- **"¿Qué es un middleware?"** → Función que se ejecuta entre el request y la respuesta. Patrón central de Express.
- **"¿Qué pasa con las sesiones si el servidor se reinicia?"** → Depende del store. Memory = se pierden. File/DB = persisten.
- **"¿Por qué httpOnly en la cookie?"** → Prevenir XSS. Si un script malicioso corre en el navegador, no puede robar la cookie de sesión.
- **"¿Sesiones o JWT?"** → Sesiones para apps server-rendered. JWT para APIs stateless. Cada una tiene trade-offs. (Anticipar la próxima clase.)
