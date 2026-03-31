# Despliegue en Dokploy

## Estructura de Docker

- `docker-compose.yml`: base de produccion
- `docker-compose.override.yml`: desarrollo local con hot reload
- `backend/Dockerfile`: backend para produccion
- `backend/Dockerfile.dev`: backend para desarrollo
- `frontend/Dockerfile`: frontend para produccion con Nginx
- `frontend/Dockerfile.dev`: frontend para desarrollo

## Variables de entorno

1. Copia `.env.example` a `.env`
2. Cambia todos los secretos:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
3. En produccion usa:
   - `NODE_ENV=production`
   - `DB_SYNC=true`
   - `DB_SYNC_ALTER=false`
   - `CORS_ORIGIN=https://tu-frontend.com`
   - `REACT_APP_API_URL=/api` si vas a publicar frontend y backend bajo el mismo dominio con proxy por ruta
   - `REACT_APP_API_URL=https://api.tu-dominio.com/api` si vas a usar backend en subdominio aparte

## Dokploy

Usa el archivo `docker-compose.yml` como base de despliegue.

### Esquema recomendado

- Expón solo `frontend`
- Deja `backend` y `database` internos en la red de Docker
- El contenedor `frontend` ya hace proxy a:
  - `/api` -> `backend:5000`
  - `/uploads` -> `backend:5000`
  - `/escuela_de_conductores` -> `backend:5000`

Con esto puedes usar un solo dominio, por ejemplo:
- `https://app.tudominio.com`

Y el frontend hablará con el backend mediante `/api` sin CORS extra.

### Persistencias recomendadas

- `mysql_data`
- `uploads_data`
- `escuela_data`

### Puertos internos

- frontend: `80`
- backend: `5000`
- mysql: `3306`

### Variables recomendadas en Dokploy

- `NODE_ENV=production`
- `DB_SYNC=true`
- `DB_SYNC_ALTER=false`
- `REACT_APP_API_URL=/api`
- `CORS_ORIGIN=https://app.tudominio.com`

### Servicio a publicar

Publica el servicio `frontend` con tu dominio.
No necesitas publicar el puerto del backend si usarás el proxy incluido en Nginx.

## Recomendaciones

- No actives `DB_SYNC_ALTER=true` en produccion.
- Si ya tienes archivos subidos en local, mueve el contenido de `uploads` y `escuela_de_conductores` a los volúmenes persistentes de la VPS.
- Si expones backend y frontend en dominios distintos, configura `CORS_ORIGIN` con el dominio público del frontend.
