# JWT con Passport - Conceptos Básicos

## Estructura de un JWT
- **Header (encabezado)**: algoritmo y tipo de token.
- **Payload**: Claims (sub, email, exp, etc)
- **Signature**: Firma digital

## Pasos para levantar

1. Copiar `.env.example` a `.env` y configurar valores
2. Instalar dependencias: `npm install`
3. Iniciar servidor: `npm start`
4. Probar con Postman:
   - POST `/auth/register` - Crear usuario
   - POST `/auth/login` - Obtener token
   - GET `/dashboard` - Encabezado: `Authorization: Bearer <token>`

## Rutas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/register | Registrar usuario |
| POST | /auth/login | Generar JWT |
| GET | /auth/profile | Perfil (protegido) |
| GET | /dashboard | Dashboard (protegido) |
