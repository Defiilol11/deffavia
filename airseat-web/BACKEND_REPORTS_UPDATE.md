# Actualización Requerida en el Backend - Reportes

## Cambio Necesario en `/api/reports/summary`

Para mostrar los asientos coloreados según su modo de reserva (manual/random/imported) en el frontend, necesitas agregar un nuevo campo a la respuesta del endpoint de reportes.

### Modificación en el Endpoint

Agrega la siguiente consulta a tu endpoint `router.get('/summary', ...)`:

```javascript
// Después de las consultas existentes, agrega:

// Asientos con su modo de reserva
const seatsByMode = (await pool.query(`
  SELECT
    ri.seat_code as code,
    ro.mode
  FROM reservation_item ri
  JOIN reservation_order ro ON ri.order_id = ro.id
  WHERE ri.status != 'canceled'
`)).rows;

// Y agrégalo a la respuesta:
res.json({
  ok: true,
  users,
  businessOcup: byClass.business?.occupied || 0,
  economyOcup: byClass.economy?.occupied || 0,
  businessFree: byClass.business?.free || 0,
  economyFree: byClass.economy?.free || 0,
  manual: byMode['manual'] || 0,
  random: byMode['random'] || 0,
  imported: byMode['imported'] || 0,
  modificados: itemStats.modified_items || 0,
  cancelados: itemStats.canceled_items || 0,
  reservasPorUsuario: ordersByUser,
  seatsByMode: seatsByMode  // ← NUEVO CAMPO
});
```

### Formato Esperado

El frontend espera recibir:

```typescript
{
  // ... campos existentes ...
  seatsByMode: [
    { code: 'A3', mode: 'manual' },
    { code: 'B4', mode: 'random' },
    { code: 'C5', mode: 'imported' },
    // ... más asientos ...
  ]
}
```

### Colores en el Frontend

Los asientos se mostrarán con estos colores según su modo:

- **Manual**: Azul (#3b82f6)
- **Random/Aleatorio**: Verde (#22c55e)
- **Imported/Importado**: Naranja (#f97316)

Estos colores coinciden con los indicadores en la sección "🎯 Modo de Reserva" del panel.
