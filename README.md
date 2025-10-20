# Deffavia — Sistema de reservas (Angular + Node/Express + PostgreSQL)

[English version below]

## Descripción

Aplicación web para reservar asientos:

- Registro/Login (@gmail/@outlook).
- Modelo de reservas por Orden + Ítems (múltiples asientos).
- Modo de selección: manual (mapa) o aleatorio (en backend).
- Validación CUI, VIP (-10% por >5 órdenes activas previas).
- Modificar asiento (+10% por ítem), cancelar asiento o reserva completa.
- Exportación/Importación XML (agrupa por usuario+fecha, continúa ante errores).
- Reportes (ocupación por clase, conteos, modificados/cancelados).
- Emails HTML con branding (registro, confirmación, modificación, cancelaciones).
- Swagger en /api/docs.

## Estructura

- api: Backend Express + OpenAPI.
- airseat-web: Frontend Angular (wizard, mis reservas, reportes, XML).
- docs: Postman collection y documentación auxiliar.

## Requisitos

- Node 18+ (recomendado 20)
- PostgreSQL 14+ (recomendado 16)
- SMTP real o Ethereal (pruebas automáticas si no hay credenciales)

## Configuración — API (local)

1. Variables de entorno (no se comitea .env)

```bash
cp api/.env.example api/.env
# Ajusta PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, JWT_SECRET
# Para correo, define SMTP_* o usa USE_ETHEREAL=true
```

2. Base de datos

- Crea la base (por ejemplo “deffavia”).
- Aplica el esquema:
  - db/schema_aligned.sql
  - db/migrations/20251020_create_views_for_reports.sql
- Verifica con: db/sanity_check.sql

3. Instalar y ejecutar

```bash
cd api
npm install
npm start
# API:    http://localhost:3001
# Swagger http://localhost:3001/api/docs
```

4. Seed de asientos (57)

```bash
curl -X POST http://localhost:3001/api/admin/seed-seats
```

## Configuración — Frontend (Angular)

```bash
cd airseat-web
npm install
npm start
# App: http://localhost:4200
```

- Ajusta el proxy (proxy.conf.json) para enrutar a http://localhost:3001/api si aplica.

## Flujo de prueba rápido (API)

1. POST /api/users → registro (envía email de bienvenida)
2. POST /api/auth/login → token JWT
3. POST /api/reservations (manual/random) → crea orden, envía correo
4. GET /api/reservations/my → ver órdenes/ítems
5. PATCH /api/reservations/:orderId/items/:itemId/seat → +10% y correo
6. POST /api/reservations/:orderId/items/:itemId/cancel → correo
7. POST /api/reservations/:orderId/cancel → correo
8. GET /api/files/export-xml
9. POST /api/files/import-xml
10. GET /api/reports/summary

## Modelo de datos (resumen)

- seat(id, code, class)
- reservation_order(id, user_id, user_email, mode, status, price_subtotal, discount_total, modifiers_total, total, reserved_at)
- reservation_item(id, order_id, seat_id, passenger_name, cui, has_luggage, price, modifiers, discount, total, status, modified_count, created_at)
- Índice único parcial: ux_reservation_item_seat_active (evita doble ocupación activa)
- Vistas: v_seat_occupancy, v_seat_class_counts, v_order_items

## Notas de seguridad

- JWT Bearer en reservas.
- Validación CUI en altas y cambios.
- Locks con SELECT … FOR UPDATE SKIP LOCKED para asignación aleatoria.

## Colección Postman

- Archivo en docs/Deffavia.postman_collection.json
- Variables: baseUrl, token, userEmail.

## Troubleshooting

- v_seat_class_counts no existe → ejecuta db/migrations/20251020_create_views_for_reports.sql
- ON CONSTRAINT falla → usa ON CONFLICT DO NOTHING en inserts de reservation_item
- Random ocupó asiento → confirma locks y que /api/seats usa v_seat_occupancy
- Emails → usa USE_ETHEREAL=true para ver enlaces de previsualización en consola.

---

# Deffavia — Seat reservation system (Angular + Node/Express + PostgreSQL)

## Overview

- Register/Login (@gmail/@outlook)
- Order + Items model (multiple seats)
- Manual (map) or random selection (server-side with row locks)
- CUI validation, VIP discount (-10%)
- Modify seat (+10%), cancel seat/order
- XML export/import (group by user+date, error-tolerant)
- Reports (occupancy, counts, changes)
- Branded HTML emails
- Swagger at /api/docs

## Setup

- API: copy api/.env.example → api/.env, apply SQL, npm install, npm start
- Frontend: npm install, npm start
- Seed: POST /api/admin/seed-seats
- Test with Swagger or Postman (docs/Deffavia.postman_collection.json)
