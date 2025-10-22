# 🚀 Nuevas Funcionalidades API - Resumen de Cambios

Este documento resume todos los cambios implementados en la API para soportar las nuevas funcionalidades del frontend.

---

## 📋 Índice de Endpoints

### ✅ Ya Existentes (No requieren cambios)
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Actualizar perfil (email/password)
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/reports/summary` - Dashboard de reportes
- `GET /api/reservations/my` - Mis reservas
- `POST /api/reservations` (modos: manual, random)

### 🆕 Nuevos Endpoints Implementados

#### 1. **Recomendaciones Inteligentes**
```
GET /api/recommendations/seats?userEmail={email}
```

#### 2. **Reservas en Grupo**
```
POST /api/reservations (modo: group)
```

#### 3. **Consulta de Asientos Contiguos**
```
GET /api/seats/contiguous?class={business|economy}&count={número}
```

---

## 🔥 1. Recomendaciones Inteligentes

### Endpoint
```http
GET /api/recommendations/seats?userEmail=user@example.com
Authorization: Bearer {token}
```

### Respuesta
```json
{
  "ok": true,
  "recommendations": {
    "favoriteClass": "business",
    "favoriteSeats": [
      {
        "code": "A1",
        "class": "business",
        "timesReserved": 3
      },
      {
        "code": "A2",
        "class": "business",
        "timesReserved": 2
      }
    ],
    "suggestedSeats": [
      {
        "code": "A3",
        "class": "business",
        "available": true
      },
      {
        "code": "A4",
        "class": "business",
        "available": true
      }
    ],
    "popularSeats": [
      {
        "code": "C1",
        "class": "economy",
        "totalReservations": 15
      }
    ],
    "reasoning": "Basado en tus 5 reservas en clase Business, tu asiento favorito es A1"
  }
}
```

### Lógica Implementada
1. **Clase Favorita**: Detecta qué clase (business/economy) reserva más el usuario
2. **Asientos Favoritos**: Top 5 asientos más reservados por el usuario
3. **Sugerencias**: Asientos disponibles en la misma clase y filas favoritas
4. **Populares**: Top 5 asientos más reservados globalmente
5. **Razonamiento**: Mensaje personalizado explicando las recomendaciones

### Archivo
`src/routes/recommendations.js`

---

## 👥 2. Reservas en Grupo

### Endpoint Modificado
```http
POST /api/reservations
Authorization: Bearer {token}
Content-Type: application/json
```

### Nuevo Modo: "group"

#### Request Body
```json
{
  "userEmail": "user@example.com",
  "mode": "group",
  "group": {
    "seatClass": "business",
    "count": 5,
    "requireContiguous": true,
    "groupName": "Familia García",
    "passengers": [
      {
        "passengerName": "Juan García",
        "cui": "1234567890123",
        "hasLuggage": true,
        "isLeader": true
      },
      {
        "passengerName": "María García",
        "cui": "9876543210987",
        "hasLuggage": false,
        "isLeader": false
      }
      // ... más pasajeros
    ]
  }
}
```

#### Response
```json
{
  "ok": true,
  "orderId": 123,
  "isVip": false,
  "subtotal": 6000.00,
  "discountTotal": 0,
  "total": 6000.00,
  "items": [
    {
      "id": 1,
      "seatCode": "A1",
      "seatClass": "business",
      "passengerName": "Juan García",
      "cui": "1234567890123",
      "total": 1200.00
    }
    // ... más items
  ]
}
```

### Características
- ✅ **Asientos Contiguos**: Si `requireContiguous: true`, busca asientos en la misma fila
- ✅ **Líder de Grupo**: Marca automáticamente al primer pasajero o al que tenga `isLeader: true`
- ✅ **Mínimo 2 personas**: Los grupos deben tener al menos 2 pasajeros
- ✅ **Validación de CUI**: Valida todos los CUIs antes de reservar
- ✅ **Transaccional**: Usa `FOR UPDATE SKIP LOCKED` para evitar condiciones de carrera

### Algoritmo de Asientos Contiguos
1. Busca filas con al menos N asientos disponibles
2. Agrupa por letra de fila (A, B, C, etc.)
3. Selecciona los primeros N asientos de la fila encontrada
4. Bloquea los asientos con `FOR UPDATE SKIP LOCKED`
5. Si no hay contiguos disponibles, lanza error

### Archivo Modificado
`src/routes/reservations.js` (líneas 111-199)

---

## 🪑 3. Consulta de Asientos Contiguos

### Endpoint
```http
GET /api/seats/contiguous?class=business&count=5
```

### Query Parameters
- `class` (required): "business" o "economy"
- `count` (required): Número de asientos contiguos deseados (mínimo 2)

### Response
```json
{
  "ok": true,
  "available": true,
  "count": 3,
  "options": [
    {
      "row": "A",
      "seats": ["A1", "A2", "A3", "A4", "A5"],
      "totalSeatsAvailable": 7,
      "pricePerSeat": 1200.00,
      "totalPrice": 6000.00
    },
    {
      "row": "B",
      "seats": ["B2", "B3", "B4", "B5", "B6"],
      "totalSeatsAvailable": 8,
      "pricePerSeat": 1200.00,
      "totalPrice": 6000.00
    },
    {
      "row": "C",
      "seats": ["C1", "C2", "C3", "C4", "C5"],
      "totalSeatsAvailable": 6,
      "pricePerSeat": 1200.00,
      "totalPrice": 6000.00
    }
  ]
}
```

### Uso
Este endpoint permite **previsualizar** opciones de asientos grupales antes de hacer la reserva.

### Archivo
`src/routes/seats.js`

---

## 🗄️ Cambios en Base de Datos (Opcionales)

### Campos Adicionales Recomendados

Aunque el código actual funciona sin estos campos, se recomienda agregarlos para mejor organización:

```sql
-- Tabla reservation_order
ALTER TABLE reservation_order
ADD COLUMN IF NOT EXISTS group_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS group_size INT DEFAULT 1;

-- Tabla reservation_item
ALTER TABLE reservation_item
ADD COLUMN IF NOT EXISTS is_group_leader BOOLEAN DEFAULT FALSE;
```

> **Nota**: El código actual funciona sin estos campos, pero agregarlos mejora la trazabilidad de grupos.

---

## 📦 Archivos Creados/Modificados

### Archivos Nuevos
1. `src/routes/recommendations.js` - Endpoint de recomendaciones
2. `src/routes/seats.js` - Endpoint de asientos contiguos

### Archivos Modificados
1. `src/routes/reservations.js` - Agregado modo "group"
2. `src/index.js` - Registradas nuevas rutas

---

## 🧪 Pruebas de los Endpoints

### 1. Probar Recomendaciones
```bash
curl -X GET "http://localhost:3001/api/recommendations/seats?userEmail=user@gmail.com" \
  -H "Authorization: Bearer {token}"
```

### 2. Probar Reserva en Grupo
```bash
curl -X POST "http://localhost:3001/api/reservations" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@gmail.com",
    "mode": "group",
    "group": {
      "seatClass": "business",
      "count": 3,
      "requireContiguous": true,
      "groupName": "Familia Test",
      "passengers": [
        {"passengerName": "Juan Test", "cui": "1234567890123", "hasLuggage": true, "isLeader": true},
        {"passengerName": "María Test", "cui": "2345678901234", "hasLuggage": false},
        {"passengerName": "Pedro Test", "cui": "3456789012345", "hasLuggage": true}
      ]
    }
  }'
```

### 3. Probar Consulta de Contiguos
```bash
curl -X GET "http://localhost:3001/api/seats/contiguous?class=business&count=5"
```

---

## ✅ Checklist de Implementación

- [x] Endpoint de recomendaciones inteligentes
- [x] Modo "group" en reservaciones
- [x] Búsqueda de asientos contiguos
- [x] Validación de CUIs en grupos
- [x] Manejo de transacciones con locks
- [x] Registro de rutas en index.js
- [ ] Migración de base de datos (opcional)
- [ ] Tests unitarios (recomendado)
- [ ] Documentación en Swagger (recomendado)

---

## 🎯 Próximos Pasos Recomendados

1. **Agregar descuentos por grupo**:
   - 5-9 personas: 10% descuento
   - 10+ personas: 15% descuento

2. **Mejorar el algoritmo de contiguos**:
   - Priorizar filas centrales
   - Considerar preferencias del usuario

3. **Notificaciones de grupo**:
   - Email a todos los miembros del grupo
   - Líder recibe resumen completo

4. **Gestión de grupos post-reserva**:
   - Ver todos los miembros del grupo
   - Modificar/cancelar toda la reserva grupal de una vez

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación, revisa:
- **Código fuente**: Comentarios en cada archivo
- **Logs**: Console logs detallados en cada operación
- **Errores**: Manejo de errores con mensajes descriptivos

---

**Última actualización**: Octubre 22, 2025
**Versión API**: 1.1.0
