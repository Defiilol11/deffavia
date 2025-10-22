# Deffavia — Sistema de reservas (Angular + Node/Express + PostgreSQL)

[English version below]

## Descripción

Aplicación web completa para reservar asientos de avión con las siguientes características:

### Funcionalidades principales

- **Autenticación**: Registro/Login con validación de correos @gmail/@outlook
- **Reservas**:
  - Modelo por Orden + Ítems (múltiples asientos por reserva)
  - Selección manual (mapa interactivo) o aleatoria (servidor con locks)
  - Validación de CUI (13 dígitos)
  - Sistema VIP: descuento -10% para usuarios con >5 órdenes activas
- **Gestión de reservas**:
  - Modificar asiento (+10% de recargo por modificación)
  - Cancelar asiento individual o reserva completa
  - Historial de modificaciones
- **Importación/Exportación**:
  - XML con agrupación por usuario+fecha
  - Procesamiento tolerante a errores con reporte detallado
- **Reportes**:
  - Ocupación por clase (negocios/económica)
  - Conteo de asientos libres/ocupados
  - Historial de modificaciones y cancelaciones
- **Notificaciones**:
  - Emails HTML con branding personalizado
  - Templates para: registro, confirmación, modificación, cancelaciones
- **Documentación**: Swagger UI en `/api/docs`

## Estructura del proyecto

```
deffavia/
├── api/                          # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js             # Servidor principal y configuración
│   │   ├── auth.js              # Middleware JWT y rutas de autenticación
│   │   ├── users.js             # CRUD de usuarios
│   │   ├── reservations.js      # Lógica de reservas (manual/random)
│   │   ├── files.js             # Export/Import XML
│   │   ├── mail.js              # Envío de correos
│   │   ├── mail-templates.js    # Templates HTML para emails
│   │   ├── reports.js           # Reportes y estadísticas
│   │   └── openapi.yaml         # Especificación OpenAPI 3.0
│   ├── docs/                    # Documentación adicional
│   ├── .env.example             # Variables de entorno template
│   └── package.json
│
├── airseat-web/                 # Frontend Angular 20
│   ├── src/
│   │   ├── app/
│   │   │   ├── app/
│   │   │   │   ├── core/       # Servicios singleton
│   │   │   │   │   ├── api.service.ts
│   │   │   │   │   ├── auth.api.ts
│   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   ├── email.service.ts
│   │   │   │   │   ├── files-api.service.ts
│   │   │   │   │   └── reservations-api.service.ts
│   │   │   │   ├── features/   # Módulos por funcionalidad
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── register/
│   │   │   │   │   │   └── user-store.service.ts
│   │   │   │   │   ├── seats/
│   │   │   │   │   │   └── seat-map/  # Componente mapa de asientos
│   │   │   │   │   ├── reservations/
│   │   │   │   │   │   ├── reservation-wizard/  # Wizard multi-paso
│   │   │   │   │   │   ├── my-reservations/     # Gestión de reservas
│   │   │   │   │   │   ├── reservation-store.service.ts
│   │   │   │   │   │   └── components/
│   │   │   │   │   ├── files/
│   │   │   │   │   │   └── files-page/  # Import/Export XML
│   │   │   │   │   └── reports/
│   │   │   │   │       └── reports-page/  # Dashboard de reportes
│   │   │   │   ├── layout/     # Componentes de layout
│   │   │   │   │   └── topbar/
│   │   │   │   ├── pages/      # Páginas estáticas
│   │   │   │   │   ├── home/
│   │   │   │   │   └── about/
│   │   │   │   └── shared/     # Utilidades compartidas
│   │   │   │       ├── models/
│   │   │   │       └── utils/
│   │   │   ├── app.component.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── environments/
│   │   │   └── environment.ts   # Configuración del entorno
│   │   ├── styles.scss          # Estilos globales (tema claro)
│   │   └── index.html
│   ├── proxy.conf.json          # Proxy para desarrollo
│   ├── angular.json
│   └── package.json
│
├── db/                          # Scripts SQL
│   ├── schema_aligned.sql       # Esquema completo de la BD
│   ├── migrations/
│   │   └── 20251020_create_views_for_reports.sql
│   └── sanity_check.sql         # Verificación de integridad
│
├── docs/
│   └── Deffavia.postman_collection.json
│
└── README.md
```

## Requisitos

- **Node.js**: 18+ (recomendado 20+)
- **PostgreSQL**: 14+ (recomendado 16)
- **SMTP**: Servidor real o usa Ethereal para pruebas automáticas
- **Angular CLI**: 20+ (opcional, usa `npx` si no está instalado globalmente)

## Configuración — API (Backend)

### 1. Variables de entorno

```bash
cd api
cp .env.example .env
```

Edita `api/.env` con tus credenciales:

```env
# Base de datos
PGHOST=localhost
PGPORT=5432
PGDATABASE=deffavia
PGUSER=postgres
PGPASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro_de_al_menos_32_caracteres

# SMTP (opcional, usa Ethereal si no tienes)
USE_ETHEREAL=true
# O configura SMTP real:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM=Deffavia <noreply@deffavia.com>

# Puerto del servidor
PORT=3001
```

### 2. Base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE deffavia;"

# Aplicar el esquema principal
psql -U postgres -d deffavia -f db/schema_aligned.sql

# Aplicar migraciones (vistas para reportes)
psql -U postgres -d deffavia -f db/migrations/20251020_create_views_for_reports.sql

# Verificar integridad (opcional)
psql -U postgres -d deffavia -f db/sanity_check.sql
```

### 3. Instalar dependencias y ejecutar

```bash
cd api
npm install
npm start
```

La API estará disponible en:
- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api/docs

### 4. Seed inicial de asientos

Crea los 57 asientos predefinidos (12 negocios + 45 económicos):

```bash
curl -X POST http://localhost:3001/api/admin/seed-seats
```

Respuesta esperada:
```json
{
  "ok": true,
  "insertedOrExisting": 57
}
```

## Configuración — Frontend (Angular)

### 1. Instalar dependencias

```bash
cd airseat-web
npm install
```

### 2. Configuración del proxy (ya incluido)

El archivo `proxy.conf.json` redirige `/api` al backend:

```json
{
  "/api": {
    "target": "http://localhost:3001",
    "secure": false,
    "changeOrigin": true
  }
}
```

### 3. Variables de entorno (opcional)

Edita `src/environments/environment.ts` si necesitas cambiar configuraciones:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  mailEndpoint: '/api/mail/send-quote',
  priceBusiness: 1200,    // Precio clase negocios (Q)
  priceEconomy: 600,      // Precio clase económica (Q)
  vipThreshold: 5,        // Órdenes activas para VIP
  modificationIncrease: 0.1, // 10% recargo por modificación
};
```

### 4. Ejecutar

```bash
npm start
```

La aplicación estará disponible en: **http://localhost:4200**

## Flujo de prueba completo

### Usando la interfaz web (http://localhost:4200)

1. **Registro**:
   - Ve a "Registro" en la barra de navegación
   - Usa un email @gmail.com o @outlook.com
   - Recibirás un correo de bienvenida

2. **Login**:
   - Inicia sesión con las credenciales creadas
   - El sistema guarda el token JWT en localStorage

3. **Crear reserva**:
   - Ve a "Reservar" → Wizard multi-paso
   - Selecciona cantidad, clase y modo (manual/aleatorio)
   - Completa datos de pasajeros (nombre, CUI, maleta)
   - Revisa el resumen y correo de confirmación

4. **Mis reservas**:
   - Ve a "Mis reservas"
   - Modifica asientos (aplica +10% de recargo)
   - Cancela asientos individuales o reserva completa

5. **Exportar/Importar**:
   - Ve a "Archivos"
   - Exporta reservas activas a XML
   - Importa XML con manejo de errores

6. **Reportes**:
   - Ve a "Reportes"
   - Consulta ocupación, conteos y modificaciones

### Usando Postman (colección incluida)

Importa `docs/Deffavia.postman_collection.json`:

**Variables de colección**:
```json
{
  "baseUrl": "http://localhost:3001",
  "token": "",
  "userEmail": ""
}
```

**Flujo de prueba**:

1. `POST /api/users` → Registro (guarda email en variable)
2. `POST /api/auth/login` → Login (guarda token en variable)
3. `POST /api/reservations` → Crear reserva (manual o random)
4. `GET /api/reservations/my` → Ver mis reservas
5. `PATCH /api/reservations/:orderId/items/:itemId/seat` → Modificar asiento (+10%)
6. `POST /api/reservations/:orderId/items/:itemId/cancel` → Cancelar asiento
7. `POST /api/reservations/:orderId/cancel` → Cancelar reserva completa
8. `GET /api/files/export-xml` → Exportar XML
9. `POST /api/files/import-xml` → Importar XML
10. `GET /api/reports/summary` → Reporte de ocupación

## Modelo de datos

### Tablas principales

**seat** (asientos)
```sql
id          SERIAL PRIMARY KEY
code        VARCHAR(4) UNIQUE    -- Ej: "A1", "I7"
class       VARCHAR(20)          -- 'business' | 'economy'
```

**reservation_order** (órdenes de reserva)
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER              -- FK a users (opcional)
user_email      VARCHAR(255)
mode            VARCHAR(20)          -- 'manual' | 'random'
status          VARCHAR(20)          -- 'active' | 'cancelled'
price_subtotal  DECIMAL(10,2)
discount_total  DECIMAL(10,2)
modifiers_total DECIMAL(10,2)
total           DECIMAL(10,2)
reserved_at     TIMESTAMP DEFAULT NOW()
```

**reservation_item** (ítems individuales por asiento)
```sql
id              SERIAL PRIMARY KEY
order_id        INTEGER NOT NULL     -- FK a reservation_order
seat_id         INTEGER NOT NULL     -- FK a seat
passenger_name  VARCHAR(255)
cui             VARCHAR(13)
has_luggage     BOOLEAN
price           DECIMAL(10,2)
modifiers       DECIMAL(10,2)
discount        DECIMAL(10,2)
total           DECIMAL(10,2)
status          VARCHAR(20)          -- 'active' | 'cancelled'
modified_count  INTEGER DEFAULT 0
created_at      TIMESTAMP DEFAULT NOW()
```

### Índices y restricciones

- **Único parcial**: `ux_reservation_item_seat_active`
  - Previene doble ocupación: solo un ítem activo por asiento

### Vistas materializadas

- **v_seat_occupancy**: Estado actual de cada asiento (libre/ocupado)
- **v_seat_class_counts**: Conteos por clase de asiento
- **v_order_items**: Join completo de órdenes e ítems para reportes

## Características de seguridad

### Backend

1. **JWT Bearer Authentication**:
   - Token generado en `/api/auth/login`
   - Middleware verifica token en rutas protegidas
   - Expiración configurable

2. **Validación de CUI**:
   - Algoritmo de verificación de dígito verificador
   - Validado en registro y modificaciones

3. **Locks de base de datos**:
   - `SELECT ... FOR UPDATE SKIP LOCKED` en asignación aleatoria
   - Previene condiciones de carrera

4. **Validación de email**:
   - Solo dominios @gmail.com y @outlook.com permitidos
   - Verificación en registro

### Frontend

1. **Auth Guard**:
   - Protege rutas que requieren autenticación
   - Redirige a login si no hay token

2. **HTTP Interceptor**:
   - Inyecta token JWT automáticamente
   - Maneja errores 401 (token expirado)

3. **Validación en formularios**:
   - Validators de Angular Reactive Forms
   - Validación de CUI en tiempo real

## Estructura de archivos XML

### Exportación

```xml
<?xml version="1.0" encoding="UTF-8"?>
<flightReservation>
  <flightSeat>
    <seatNumber>A3</seatNumber>
    <passengerName>Juan Pérez</passengerName>
    <user>juan@gmail.com</user>
    <idNumber>1234567890123</idNumber>
    <hasLuggage>true</hasLuggage>
    <reservationDate>15/01/2025 14:30</reservationDate>
  </flightSeat>
  <!-- más asientos -->
</flightReservation>
```

### Importación

- Agrupa por `user + reservationDate` → crea una orden por grupo
- Continúa ante errores (asiento ocupado, CUI inválido, etc.)
- Retorna reporte detallado con éxitos/errores

## Emails con branding

Los emails HTML incluyen:
- Gradiente morado-rosado en header
- Tablas responsive para detalles
- Botones de acción estilizados
- Footer con información de contacto

### Templates disponibles

1. **Bienvenida** (`buildUserCreatedHtml`)
2. **Confirmación de reserva** (`buildOrderCreatedHtml`)
3. **Modificación de asiento** (`buildItemModifiedHtml`)
4. **Cancelación de asiento** (`buildItemCanceledHtml`)
5. **Cancelación de reserva** (`buildOrderCanceledHtml`)

### Testing de emails

Con `USE_ETHEREAL=true`, cada email muestra en consola:
```
✉ Email enviado a juan@gmail.com
🔗 Ver en: https://ethereal.email/message/[id]
```

## Troubleshooting

### Backend

**Error: `relation "v_seat_class_counts" does not exist`**
```bash
psql -U postgres -d deffavia -f db/migrations/20251020_create_views_for_reports.sql
```

**Error: `ON CONSTRAINT ... DO UPDATE` falla**
- Verifica que el índice único parcial existe
- Usa `ON CONFLICT DO NOTHING` en inserts manuales

**Asiento ocupado en modo random**
- Confirma que `/api/seats` usa `v_seat_occupancy`
- Verifica locks con `SELECT ... FOR UPDATE SKIP LOCKED`

**Emails no se envían**
- Revisa configuración SMTP en `.env`
- Usa `USE_ETHEREAL=true` para testing sin SMTP real
- Verifica logs de consola para enlaces de previsualización

### Frontend

**Error: `Cannot GET /api/...`**
- Verifica que el backend está corriendo en :3001
- Revisa `proxy.conf.json`
- Reinicia `ng serve`

**Token expirado**
- El token JWT expira (configurable en backend)
- Logout y vuelve a hacer login
- Verifica que `auth.interceptor.ts` está activo

**Mapa de asientos no carga**
- Verifica que `/api/seats` responde
- Abre DevTools → Network para ver errores
- Confirma que `seed-seats` se ejecutó

**CUI inválido**
- Debe ser exactamente 13 dígitos
- El dígito verificador debe ser correcto
- Usa generador de CUI válido para pruebas

## Testing

### Backend (API)

```bash
cd api
npm test  # Si tienes tests configurados
```

### Frontend (Angular)

```bash
cd airseat-web

# Unit tests
npm test

# E2E tests
npm run e2e

# Cobertura
npm test -- --code-coverage
```

## Deployment

### Backend (ejemplo con Heroku)

```bash
cd api
heroku create deffavia-api
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=tu_secreto_produccion
heroku config:set USE_ETHEREAL=false
heroku config:set SMTP_HOST=...
git push heroku main
```

### Frontend (ejemplo con Vercel)

```bash
cd airseat-web
npm run build
vercel --prod
```

Configura en Vercel:
- Build Command: `npm run build`
- Output Directory: `dist/airseat-web/browser`

## Licencia

ISC

---

# Deffavia — Seat reservation system (Angular + Node/Express + PostgreSQL)

## Overview

Complete flight seat reservation system with:

- **Authentication**: Register/Login with @gmail/@outlook validation
- **Reservations**:
  - Order + Items model (multiple seats per booking)
  - Manual (interactive map) or random selection (server-side with locks)
  - CUI validation (13 digits)
  - VIP system: -10% discount for users with >5 active orders
- **Reservation management**:
  - Modify seat (+10% surcharge)
  - Cancel individual seat or complete order
  - Modification history
- **Import/Export**:
  - XML with grouping by user+date
  - Error-tolerant processing with detailed report
- **Reports**:
  - Occupancy by class (business/economy)
  - Free/occupied seat counts
  - Modification and cancellation history
- **Notifications**:
  - Branded HTML emails
  - Templates for: welcome, confirmation, modification, cancellations
- **Documentation**: Swagger UI at `/api/docs`

## Quick Setup

### Backend

```bash
cd api
cp .env.example .env
# Edit .env with your credentials
npm install
npm start
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

Create database:
```bash
psql -U postgres -c "CREATE DATABASE deffavia;"
psql -U postgres -d deffavia -f db/schema_aligned.sql
psql -U postgres -d deffavia -f db/migrations/20251020_create_views_for_reports.sql
```

Seed seats:
```bash
curl -X POST http://localhost:3001/api/admin/seed-seats
```

### Frontend

```bash
cd airseat-web
npm install
npm start
# App: http://localhost:4200
```

## Testing

Use Swagger UI at `/api/docs` or import Postman collection from `docs/Deffavia.postman_collection.json`

### Postman variables:
```json
{
  "baseUrl": "http://localhost:3001",
  "token": "",
  "userEmail": ""
}
```

### Test flow:
1. POST `/api/users` → Register
2. POST `/api/auth/login` → Get JWT token
3. POST `/api/reservations` → Create reservation (manual/random)
4. GET `/api/reservations/my` → View my reservations
5. PATCH `/api/reservations/:orderId/items/:itemId/seat` → Modify seat (+10%)
6. POST `/api/reservations/:orderId/items/:itemId/cancel` → Cancel seat
7. POST `/api/reservations/:orderId/cancel` → Cancel order
8. GET `/api/files/export-xml` → Export to XML
9. POST `/api/files/import-xml` → Import from XML
10. GET `/api/reports/summary` → Occupancy report

## Features

- 57 seats: 12 business + 45 economy
- VIP discount: -10% for users with >5 active orders
- Seat modification: +10% surcharge per change
- XML export/import with error handling
- Real-time seat map with visual feedback
- Responsive design (mobile-friendly)
- Email notifications with HTML templates
- Comprehensive reporting

## Tech Stack

- **Backend**: Node.js 20, Express 4, PostgreSQL 16
- **Frontend**: Angular 20, Standalone Components, Signals
- **Auth**: JWT Bearer tokens
- **Email**: Nodemailer (SMTP/Ethereal)
- **Docs**: OpenAPI 3.0 (Swagger UI)

## License

ISC
