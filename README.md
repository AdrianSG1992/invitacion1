# Invitación XV años de Melisa

Invitación digital responsive (sitio estático) basada en la de Naydelin.

## Datos a personalizar
- Fecha/hora: `script.js` (`partyDate` y el bloque `.ics`) y `index.html` (sección `calendar-card`).
- Lugar: `index.html` (`.address` y el enlace de Google Maps) y `LOCATION` en `script.js`.
- Foto: ver comentario en `index.html` dentro de `.hero-illustration`.

## Despliegue
```bash
docker compose up -d --build
```
Queda en `http://SERVIDOR:8081` (cambiar con `HOST_PORT`).
