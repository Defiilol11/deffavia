# 🔧 Fix: Modo 'group' en Reservaciones

## ❌ Problema

```
Error: new row for relation "reservation_order" violates check constraint "reservation_order_mode_check"
```

**Causa**: La tabla `reservation_order` tiene un CHECK constraint que solo permite:
- 'manual'
- 'random'
- 'imported'

Pero NO incluye 'group' (el nuevo modo que agregamos).

---

## ✅ Solución Temporal (YA IMPLEMENTADA)

He modificado el código para mapear `mode: 'group'` → `'manual'` al guardar en la base de datos.

**Archivo**: `src/routes/reservations.js` (línea ~225)

```javascript
// Mapear modo 'group' a 'manual' para compatibilidad
const dbMode = mode === 'group' ? 'manual' : (mode || 'manual');
```

**Ventaja**: Funciona inmediatamente sin cambios en BD
**Desventaja**: Pierdes la trazabilidad de que fue una reserva grupal

---

## 🎯 Solución Permanente (RECOMENDADA)

### Ejecutar esta migración SQL:

```sql
-- Eliminar constraint existente
ALTER TABLE reservation_order
DROP CONSTRAINT IF EXISTS reservation_order_mode_check;

-- Crear nuevo constraint con 'group'
ALTER TABLE reservation_order
ADD CONSTRAINT reservation_order_mode_check
CHECK (mode IN ('manual', 'random', 'imported', 'group'));
```

**Después de ejecutar la migración**, actualiza el código:

```javascript
// En src/routes/reservations.js, línea ~225
// CAMBIAR de:
const dbMode = mode === 'group' ? 'manual' : (mode || 'manual');

// A:
const dbMode = mode || 'manual';
```

---

## 📋 Pasos para Aplicar la Solución Permanente

### 1. Ejecutar la migración

**Opción A - Desde psql:**
```bash
psql -U postgres -d deffavia -f migrations/add_group_mode.sql
```

**Opción B - Desde tu cliente SQL favorito:**
Copia y pega el SQL de arriba.

### 2. Verificar que funcionó

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'reservation_order'::regclass
  AND conname = 'reservation_order_mode_check';
```

Deberías ver:
```
reservation_order_mode_check | CHECK (mode = ANY (ARRAY['manual'::text, 'random'::text, 'imported'::text, 'group'::text]))
```

### 3. Actualizar el código (opcional)

Una vez que la migración esté aplicada, puedes simplificar el código removiendo el mapeo temporal:

```javascript
// src/routes/reservations.js
// Línea ~225

// ANTES (temporal):
const dbMode = mode === 'group' ? 'manual' : (mode || 'manual');

// DESPUÉS (permanente):
const dbMode = mode || 'manual';
```

---

## 🧪 Probar que Funciona

### Con la solución temporal (actual):
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@gmail.com",
    "mode": "group",
    "group": {
      "seatClass": "economy",
      "count": 3,
      "requireContiguous": true,
      "passengers": [
        {"passengerName": "Test 1", "cui": "1234567890123", "hasLuggage": true},
        {"passengerName": "Test 2", "cui": "2234567890123", "hasLuggage": false},
        {"passengerName": "Test 3", "cui": "3234567890123", "hasLuggage": true}
      ]
    }
  }'
```

**Resultado esperado**:
- ✅ Crea la reserva exitosamente
- ⚠️ En la BD aparece como `mode: 'manual'` (no como 'group')

### Después de aplicar la migración:
- ✅ Crea la reserva exitosamente
- ✅ En la BD aparece como `mode: 'group'` (correcto)

---

## 📊 Estado Actual

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **API funciona** | ✅ SÍ | Puede procesar `mode: 'group'` |
| **Guarda en BD** | ⚠️ Temporal | Guarda como 'manual' |
| **Migración disponible** | ✅ SÍ | Ver `migrations/add_group_mode.sql` |
| **Trazabilidad** | ❌ NO | Se pierde que fue reserva grupal |

---

## 🎯 Recomendación

**Ejecuta la migración SQL lo antes posible** para tener trazabilidad completa de las reservas grupales. Es una operación segura que toma menos de 1 segundo.

---

**Fecha**: 2025-10-22
**Archivos relacionados**:
- `src/routes/reservations.js` (código temporal)
- `migrations/add_group_mode.sql` (migración permanente)
