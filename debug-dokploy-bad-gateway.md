# Debug Session: dokploy-bad-gateway

Status: OPEN

## Symptom
- Produccion en Dokploy muestra `Bad Gateway` al abrir el dominio publico.

## Expected
- El frontend React/Vite debe responder correctamente a traves de Nginx en el contenedor Docker.

## Hypotheses
1. Dokploy apunta al servicio o puerto incorrecto en `docker-compose.yml`.
2. Nginx no queda escuchando en `80` dentro del contenedor.
3. El contenedor falla durante build o arranque y no expone HTTP util.
4. La configuracion Compose actual no coincide con lo que Dokploy espera para enrutar el dominio.
5. El healthcheck o la deteccion del servicio no estan alineados con la exposicion real del contenedor.

## Evidence Plan
- Revisar `docker-compose.yml`, `Dockerfile` y `nginx.conf`.
- Verificar consistencia entre `EXPOSE`, `expose`, `healthcheck` y puerto servido.
- Ajustar solo archivos de despliegue si la evidencia lo exige.

## Progress Log
- Sesion iniciada.
- Revisado `Dockerfile`: Nginx expone `80` y sirve `dist/`.
- Revisado `nginx.conf`: SPA React correcta con fallback a `index.html`.
- Revisado `docker-compose.yml`: servicio `mbsport-pos` con `expose: 80`.
- Evidencia externa: documentacion de Dokploy indica que `Bad Gateway` en dominios suele deberse a puerto interno o servicio incorrecto en la configuracion del dominio.

## Current Assessment
- El repositorio ya esta consistente para servir la app en el puerto interno `80`.
- La hipotesis mas probable ahora es configuracion del dominio/servicio en Dokploy o despliegue sobre cache/configuracion previa.

## New Evidence
- Captura de Dokploy confirma que el dominio `pos.mbracesrd.lat` esta configurado con `Port: 3000`.
- Esto contradice la configuracion real del contenedor:
  - `Dockerfile` expone `80`.
  - `nginx.conf` escucha en `80`.
  - `docker-compose.yml` expone internamente `80`.
- Tras cambiar el puerto, el error visible cambia de `Bad Gateway` a `404 page not found`.

## Hypothesis Status
1. Dokploy apunta al servicio o puerto incorrecto en `docker-compose.yml`. -> CONFIRMADA parcialmente por configuracion de dominio apuntando a puerto incorrecto.
2. Nginx no queda escuchando en `80` dentro del contenedor. -> DESCARTADA por configuracion revisada.
3. El contenedor falla durante build o arranque y no expone HTTP util. -> SIN EVIDENCIA todavia.
4. La configuracion Compose actual no coincide con lo que Dokploy espera para enrutar el dominio. -> PARCIALMENTE CONFIRMADA por puerto de dominio mal definido.
5. El healthcheck o la deteccion del servicio no estan alineados con la exposicion real del contenedor. -> SECUNDARIA; revisar solo si cambiar a puerto 80 no resuelve.

## Interpretation Update
- `404 page not found` sugiere que Traefik/Dokploy ya esta recibiendo la solicitud, pero la ruta de dominio no esta enlazada correctamente al servicio final o la configuracion no se ha regenerado aun.
