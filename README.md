# Campus Lago

Red social interna para el centro educativo IES El Lago (Madrid). Desarrollada como Trabajo de Fin de Ciclo de DAW por Enzo Espiño Corral.

## Qué es

Una plataforma privada donde alumnos y profesores del centro pueden publicar contenido, comentar, enviarse mensajes y seguirse entre sí. El acceso está restringido a cuentas `@educa.madrid.org` y requiere aprobación del administrador.

## Stack

- **Frontend:** HTML, CSS y JavaScript
- **Backend:** Node.js + Express
- **Base de datos:** MySQL 8
- **Auth:** JWT + bcryptjs
- **Imágenes:** Cloudinary
- **Despliegue:** Netlify (frontend) · Render (backend) · Clever Cloud (MySQL)

## Levantar en local

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5500`
- API: `http://localhost:3000`

La base de datos se inicializa sola con el esquema y datos de prueba (15 usuarios, contraseña `password` para todos).


## Variables de entorno

Copiar `backend/.env.example` y rellenar:

| Variable | Descripción |
|---|---|
| `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Conexión MySQL |
| `JWT_SECRET` | Secreto para firmar tokens |
| `FRONTEND_URL` | URL del frontend (CORS) |
| `CLOUDINARY_*` | Opcional — para subida de imágenes |

## Credenciales de prueba

| Email | Rol |
|---|---|
| `admin@educa.madrid.org` | Administrador |
| `ana.lopez@educa.madrid.org` | Profesor |
| `laura.garcia@educa.madrid.org` | Alumno |

Contraseña para todos: `password`

## Estructura

```
├── backend/
│   └── src/
│       ├── routes/        auth, posts, users, messages, search, notifications
│       ├── middleware/     auth (JWT), upload (Cloudinary)
│       ├── services/       ValidationService
│       └── db/            schema.sql, connection.js
├── frontend/
│   ├── js/                config, api, auth, home, profile, messages, search, theme
│   ├── css/style.css
│   └── *.html             index, home, profile, messages, search
├── docker-compose.yml
└── seed.sql
```
