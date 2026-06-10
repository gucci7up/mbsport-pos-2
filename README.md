# MBSPORT POS

Frontend POS de MBSPORT construido con React, Vite, TypeScript y Zustand.

## Instalacion Local

```bash
npm install
npm run dev
```

La aplicacion queda disponible en `http://localhost:3000`.

## Build

```bash
npm run build
```

El resultado de produccion se genera en `dist/`.

## Docker

Construir la imagen:

```bash
docker build -t mbsport-pos .
```

Ejecutar el contenedor:

```bash
docker run -p 3000:80 mbsport-pos
```

La aplicacion queda servida por Nginx en `http://localhost:3000`.

## Variables De Entorno

Usa `.env.example` como referencia:

```env
VITE_API_URL=https://api.mbsport.do
VITE_WS_URL=wss://api.mbsport.do/ws
VITE_ENVIRONMENT=Produccion
```

## Dokploy

Pasos sugeridos para desplegar en Dokploy:

1. Crear una nueva aplicacion tipo Docker.
2. Conectar el repositorio GitHub del proyecto.
3. Usar la rama `main`.
4. Confirmar que Dokploy detecte el `Dockerfile` en la raiz.
5. Configurar las variables de entorno necesarias basadas en `.env.example`.
6. Desplegar la aplicacion.

El contenedor genera el build de Vite y sirve el frontend con Nginx, incluyendo:

- fallback SPA para React Router
- gzip habilitado
- cache para assets versionados
- healthcheck HTTP en `/`
