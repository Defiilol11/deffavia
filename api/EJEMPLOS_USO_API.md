# 🎯 Ejemplos Prácticos de Uso - API

## Escenario 1: Usuario Nuevo sin Historial

### 1. Pedir Recomendaciones
```http
GET /api/recommendations/seats?userEmail=nuevo@gmail.com
Authorization: Bearer {token}
```

**Respuesta**:
```json
{
  "ok": true,
  "recommendations": {
    "favoriteClass": null,
    "favoriteSeats": [],
    "suggestedSeats": [],
    "popularSeats": [
      {"code": "A1", "class": "business", "totalReservations": 25},
      {"code": "C3", "class": "economy", "totalReservations": 20}
    ],
    "reasoning": "No tienes historial de reservas aún."
  }
}
```

---

## Escenario 2: Usuario con Historial (VIP)

### 1. Pedir Recomendaciones
```http
GET /api/recommendations/seats?userEmail=vip@gmail.com
Authorization: Bearer {token}
```

**Respuesta**:
```json
{
  "ok": true,
  "recommendations": {
    "favoriteClass": "business",
    "favoriteSeats": [
      {"code": "A1", "class": "business", "timesReserved": 5},
      {"code": "A2", "class": "business", "timesReserved": 3}
    ],
    "suggestedSeats": [
      {"code": "A3", "class": "business", "available": true},
      {"code": "A4", "class": "business", "available": true}
    ],
    "popularSeats": [...],
    "reasoning": "Basado en tus 8 reservas en clase Business, tu asiento favorito es A1"
  }
}
```

---

## Escenario 3: Reserva Grupal Familiar (5 personas)

### Paso 1: Consultar disponibilidad de asientos contiguos
```http
GET /api/seats/contiguous?class=economy&count=5
```

**Respuesta**:
```json
{
  "ok": true,
  "available": true,
  "count": 3,
  "options": [
    {
      "row": "A",
      "seats": ["A3", "A4", "A5", "A6", "A7"],
      "totalSeatsAvailable": 7,
      "pricePerSeat": 600.00,
      "totalPrice": 3000.00
    },
    {
      "row": "C",
      "seats": ["C3", "C4", "C5", "C6", "C7"],
      "totalSeatsAvailable": 8,
      "pricePerSeat": 600.00,
      "totalPrice": 3000.00
    }
  ]
}
```

### Paso 2: Hacer la reserva grupal
```http
POST /api/reservations
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "userEmail": "papa@gmail.com",
  "mode": "group",
  "group": {
    "seatClass": "economy",
    "count": 5,
    "requireContiguous": true,
    "groupName": "Familia Pérez",
    "passengers": [
      {
        "passengerName": "Carlos Pérez",
        "cui": "1234567890123",
        "hasLuggage": true,
        "isLeader": true
      },
      {
        "passengerName": "Ana Pérez",
        "cui": "2234567890123",
        "hasLuggage": true,
        "isLeader": false
      },
      {
        "passengerName": "Luis Pérez Jr.",
        "cui": "3234567890123",
        "hasLuggage": false,
        "isLeader": false
      },
      {
        "passengerName": "María Pérez",
        "cui": "4234567890123",
        "hasLuggage": false,
        "isLeader": false
      },
      {
        "passengerName": "Sofia Pérez",
        "cui": "5234567890123",
        "hasLuggage": true,
        "isLeader": false
      }
    ]
  }
}
```

**Respuesta**:
```json
{
  "ok": true,
  "orderId": 456,
  "isVip": false,
  "subtotal": 3000.00,
  "discountTotal": 0,
  "total": 3000.00,
  "items": [
    {
      "id": 100,
      "seatCode": "A3",
      "seatClass": "economy",
      "passengerName": "Carlos Pérez",
      "cui": "1234567890123",
      "total": 600.00
    },
    {
      "id": 101,
      "seatCode": "A4",
      "seatClass": "economy",
      "passengerName": "Ana Pérez",
      "cui": "2234567890123",
      "total": 600.00
    }
    // ... resto de items
  ]
}
```

---

## Escenario 4: Viaje de Negocios (3 ejecutivos)

### Paso 1: Ver opciones en Business
```http
GET /api/seats/contiguous?class=business&count=3
```

**Respuesta**:
```json
{
  "ok": true,
  "available": true,
  "count": 4,
  "options": [
    {
      "row": "I",
      "seats": ["I1", "I2"],
      "totalSeatsAvailable": 2,
      "pricePerSeat": 1200.00,
      "totalPrice": 2400.00
    }
  ]
}
```

**⚠️ Nota**: Business solo tiene 2 columnas, no pueden estar 3 juntos en la misma fila.

### Paso 2: Reservar sin requerir contiguos
```http
POST /api/reservations
```

**Body**:
```json
{
  "userEmail": "empresa@outlook.com",
  "mode": "group",
  "group": {
    "seatClass": "business",
    "count": 3,
    "requireContiguous": false,
    "groupName": "Ejecutivos TechCorp",
    "passengers": [
      {"passengerName": "Roberto Gómez", "cui": "1111111111111", "hasLuggage": true},
      {"passengerName": "Laura Martínez", "cui": "2222222222222", "hasLuggage": true},
      {"passengerName": "Diego Ramírez", "cui": "3333333333333", "hasLuggage": true}
    ]
  }
}
```

**Respuesta**: Asigna asientos disponibles (no necesariamente juntos)

---

## Escenario 5: Error - No hay suficientes asientos contiguos

### Request
```http
POST /api/reservations
```

**Body**:
```json
{
  "userEmail": "grande@gmail.com",
  "mode": "group",
  "group": {
    "seatClass": "economy",
    "count": 10,
    "requireContiguous": true,
    "passengers": [...]
  }
}
```

**Respuesta** (Error 400):
```json
{
  "ok": false,
  "error": "No hay 10 asientos contiguos disponibles en clase economy"
}
```

**Solución**: Cambiar a `requireContiguous: false` o reducir el número de personas

---

## Escenario 6: Flujo Completo con Recomendaciones

### 1. Usuario pide recomendaciones
```http
GET /api/recommendations/seats?userEmail=frecuente@gmail.com
```

**Respuesta**: "Tu asiento favorito es C5 en Economy"

### 2. Usuario hace reserva siguiendo recomendación
```http
POST /api/reservations
```

**Body**:
```json
{
  "userEmail": "frecuente@gmail.com",
  "mode": "manual",
  "selections": [
    {
      "seatCode": "C5",
      "passengerName": "Juan Frecuente",
      "cui": "9999999999999",
      "hasLuggage": true
    }
  ]
}
```

### 3. Usuario modifica a un asiento sugerido
```http
PATCH /api/reservations/123/items/456/seat
```

**Body**:
```json
{
  "newSeatCode": "C6",
  "cui": "9999999999999"
}
```

---

## 🎯 Tips de Uso

### Para el Frontend

1. **Mostrar recomendaciones al inicio del wizard de reserva**
   ```javascript
   const recommendations = await getRecommendations(userEmail);
   if (recommendations.favoriteSeats.length > 0) {
     // Destacar estos asientos en el mapa
   }
   ```

2. **Previsualizar opciones grupales antes de confirmar**
   ```javascript
   const options = await getContiguousSeats('economy', 5);
   // Mostrar las opciones en UI para que usuario elija
   ```

3. **Validar antes de intentar reserva grupal**
   ```javascript
   if (requireContiguous) {
     const available = await checkContiguous(seatClass, count);
     if (!available) {
       showWarning('No hay asientos juntos, ¿deseas continuar sin contiguos?');
     }
   }
   ```

### Para Testing

```bash
# 1. Crear usuario de prueba
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123"}'

# Copiar el token de la respuesta

# 3. Probar recomendaciones
curl -X GET "http://localhost:3001/api/recommendations/seats?userEmail=test@gmail.com" \
  -H "Authorization: Bearer {TOKEN}"

# 4. Probar grupo
curl -X POST http://localhost:3001/api/reservations \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d @grupo-test.json
```

---

## ⚠️ Errores Comunes

### Error: "CUI inválido"
```json
{"ok": false, "error": "CUI inválido: 123"}
```
**Solución**: El CUI debe tener exactamente 13 dígitos válidos según departamento/municipio de Guatemala

### Error: "No hay asientos contiguos"
```json
{"ok": false, "error": "No hay 8 asientos contiguos disponibles en clase business"}
```
**Solución**: Business solo tiene 2 columnas por fila. Usa Economy o reduce el número de personas.

### Error: "Modo inválido"
```json
{"ok": false, "error": "Modo inválido (manual|random|group)"}
```
**Solución**: Verifica que `mode` sea exactamente "manual", "random" o "group"

---

**Fecha**: Octubre 22, 2025
**Autor**: Sistema de Reservas Deffavia
