const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  buildOrderCreatedHtml, buildItemModifiedHtml,
  buildItemCanceledHtml, buildOrderCanceledHtml,
  sendMailGeneric
} = require('../mail-templates');

function basePrice(cls) {
  return cls === 'business' ? Number(process.env.PRICE_BUSINESS || 1200)
    : Number(process.env.PRICE_ECONOMY || 600);
}

function validateCui(cui) {
  const clean = String(cui || '').replace(/\D/g, '');
  if (!/^\d{13}$/.test(clean)) return { valid: false, reason: 'CUI debe tener 13 dígitos' };
  const dept = clean.slice(9, 11), muni = clean.slice(11, 13);
  const muniByDept = { '01': 17, '02': 8, '03': 16, '04': 16, '05': 13, '06': 14, '07': 19, '08': 8, '09': 24, '10': 21, '11': 9, '12': 30, '13': 32, '14': 21, '15': 8, '16': 17, '17': 14, '18': 5, '19': 11, '20': 11, '21': 7, '22': 17 };
  if (!muniByDept[dept]) return { valid: false, reason: 'Departamento inválido' };
  const m = Number(muni); if (m < 1 || m > muniByDept[dept]) return { valid: false, reason: 'Municipio inválido' };
  return { valid: true };
}

/**
 * POST /api/reservations
 * - Manual: { mode:'manual', userEmail, selections:[{seatCode, passengerName, cui, hasLuggage}] }
 * - Random: { mode:'random', userEmail, random:{ seatClass, count, passengers:[{passengerName,cui,hasLuggage}] } }
 */
router.post('/', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const { mode, userEmail } = req.body || {};
  if (!userEmail) return res.status(400).json({ ok: false, error: 'Falta userEmail' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // VIP: cantidad de ORDERS activas previas
    const vipRow = await client.query(
      `SELECT COUNT(*)::int c FROM reservation_order WHERE user_email=$1 AND status='active'`,
      [userEmail]
    );
    const isVip = vipRow.rows[0].c > 5;

    let prepared = []; // [{seatId, seatCode, seatClass, passengerName, cui, hasLuggage, price}]
    let subtotal = 0;

    if (mode === 'manual') {
      const { selections } = req.body || {};
      if (!Array.isArray(selections) || !selections.length) throw new Error('Sin asientos seleccionados');

      for (const sel of selections) {
        const v = validateCui(sel.cui); if (!v.valid) throw new Error(`CUI inválido: ${sel.cui}`);
        const seatRow = await client.query('SELECT id, class FROM seat WHERE code=$1', [sel.seatCode]);
        if (!seatRow.rowCount) throw new Error(`Asiento inexistente ${sel.seatCode}`);
        // Validación de ocupación real
        const occ = await client.query(
          `SELECT 1 FROM reservation_item WHERE seat_id=$1 AND status='active' LIMIT 1`,
          [seatRow.rows[0].id]
        );
        if (occ.rowCount) throw new Error(`Asiento ${sel.seatCode} ya está ocupado`);

        const seatId = seatRow.rows[0].id; const cls = seatRow.rows[0].class;
        const price = basePrice(cls);
        prepared.push({ seatId, seatCode: sel.seatCode, seatClass: cls, passengerName: sel.passengerName, cui: sel.cui, hasLuggage: !!sel.hasLuggage, price });
        subtotal += price;
      }
    } else if (mode === 'random') {
      const rnd = req.body.random || {};
      const seatClass = rnd.seatClass;
      const count = Number(rnd.count || 0);
      const passengers = Array.isArray(rnd.passengers) ? rnd.passengers : [];
      if (!seatClass || (seatClass !== 'business' && seatClass !== 'economy')) throw new Error('seatClass inválido');
      if (count < 1) throw new Error('count inválido');
      if (passengers.length !== count) throw new Error('Debe proveer tantos pasajeros como asientos');

      // Validar CUIs
      for (const p of passengers) {
        const v = validateCui(p.cui); if (!v.valid) throw new Error(`CUI inválido: ${p.cui}`);
      }

      // Seleccionar uno a uno, bloqueando filas de seat a medida que tomamos (SKIP LOCKED)
      const picked = [];
      for (let i = 0; i < count; i++) {
        const seatRow = await client.query(
          `SELECT s.id, s.code
             FROM seat s
            WHERE s.class=$1
              AND NOT EXISTS (
                SELECT 1 FROM reservation_item ri
                 WHERE ri.seat_id=s.id AND ri.status='active'
              )
            ORDER BY s.code ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED`,
          [seatClass]
        );
        if (!seatRow.rowCount) throw new Error(`No hay suficientes asientos libres en ${seatClass} para cubrir ${count}.`);
        picked.push(seatRow.rows[0]); // queda bloqueado hasta COMMIT
      }

      // Emparejar asientos con pasajeros
      for (let i = 0; i < count; i++) {
        const seatId = picked[i].id;
        const seatCode = picked[i].code;
        const price = basePrice(seatClass);
        const p = passengers[i];
        prepared.push({ seatId, seatCode, seatClass, passengerName: p.passengerName, cui: p.cui, hasLuggage: !!p.hasLuggage, price });
        subtotal += price;
      }
    } else {
      throw new Error('Modo inválido (manual|random)');
    }

    const discountTotal = isVip ? +(subtotal * 0.10).toFixed(2) : 0;
    const modifiersTotal = 0;
    const orderTotal = +(subtotal - discountTotal + modifiersTotal).toFixed(2);

    // Crear encabezado
    const insOrder = await client.query(
      `INSERT INTO reservation_order(user_id, user_email, mode, status, price_subtotal, discount_total, modifiers_total, total, reserved_at)
       VALUES (NULL,$1,$2,'active',$3,$4,$5,$6,NOW())
       RETURNING id`,
      [userEmail, mode || 'manual', subtotal, discountTotal, modifiersTotal, orderTotal]
    );
    const orderId = insOrder.rows[0].id;

    // Insertar ítems (si algo se colara por carrera, el índice único lo rechaza)
    const itemsOut = [];
    for (const it of prepared) {
      const total = it.price; // descuento a nivel orden
      const insItem = await client.query(
        `INSERT INTO reservation_item(order_id, seat_id, passenger_name, cui, has_luggage, price, modifiers, discount, total, status, modified_count, created_at)
   VALUES ($1,$2,$3,$4,$5,$6,0,0,$7,'active',0,NOW())
   ON CONFLICT DO NOTHING
   RETURNING id`,
        [orderId, it.seatId, it.passengerName, it.cui, it.hasLuggage, it.price, total]
      );
      if (!insItem.rowCount) {
        // Esta condición no debería ocurrir por los locks, pero mejor explicitamos el error
        throw new Error(`Asiento ${it.seatCode} se ocupó concurrentemente, intente de nuevo`);
      }
      const itemId = insItem.rows[0].id;
      await client.query(
        `INSERT INTO reservation_item_history(item_id, action, detail) VALUES ($1,'created',$2::jsonb)`,
        [itemId, JSON.stringify({ seatCode: it.seatCode })]
      );
      itemsOut.push({ id: itemId, seatCode: it.seatCode, seatClass: it.seatClass, passengerName: it.passengerName, cui: it.cui, total });
    }

    await client.query(
      `INSERT INTO reservation_order_history(order_id, action, detail) VALUES ($1,'created',$2::jsonb)`,
      [orderId, JSON.stringify({ subtotal, discountTotal, total: orderTotal })]
    );

    await client.query('COMMIT');

    // Email de confirmación
    try {
      const html = buildOrderCreatedHtml({ orderId, userEmail, subtotal, discountTotal, total: orderTotal }, itemsOut);
      await sendMailGeneric(userEmail, 'Confirmación de reserva', html);
    } catch (e) { console.error('Email order created error:', e.message); }

    res.json({
      ok: true,
      orderId,
      isVip,
      subtotal,
      discountTotal,
      total: orderTotal,
      items: itemsOut
    });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

// PATCH cambio de asiento (+10%)
router.patch('/:orderId/items/:itemId/seat', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const { orderId, itemId } = req.params;
  const { newSeatCode, cui } = req.body || {};
  if (!newSeatCode || !cui) return res.status(400).json({ ok: false, error: 'Faltan datos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const itemRow = await client.query(
      `SELECT ri.id, ri.order_id, ri.total, ri.modified_count, ri.cui, ri.status,
              s.code as old_code, s.class as seat_class
         FROM reservation_item ri
         JOIN seat s ON s.id = ri.seat_id
        WHERE ri.id=$1 AND ri.order_id=$2`, [itemId, orderId]
    );
    if (!itemRow.rowCount) throw new Error('Ítem no encontrado');
    const it = itemRow.rows[0];
    if (it.status !== 'active') throw new Error('Ítem no activo');
    if (it.cui !== cui) throw new Error('CUI no coincide');

    const newSeat = await client.query('SELECT id, class FROM seat WHERE code=$1', [newSeatCode]);
    if (!newSeat.rowCount) throw new Error('Nuevo asiento no existe');
    if (newSeat.rows[0].class !== it.seat_class) throw new Error('Debe ser misma clase');

    const increment = +(it.total * 0.10).toFixed(2);

    // Intento de switch (si hubiera colisión por índice, falla y capturamos)
    await client.query(
      `UPDATE reservation_item
          SET seat_id=$1, modifiers = modifiers + $2, total = total + $2, modified_count = modified_count + 1
        WHERE id=$3`,
      [newSeat.rows[0].id, increment, itemId]
    );

    await client.query(
      `INSERT INTO reservation_item_history(item_id, action, detail) VALUES ($1,'modified',$2::jsonb)`,
      [itemId, JSON.stringify({ from: it.old_code, to: newSeatCode, increment })]
    );

    await client.query(
      `UPDATE reservation_order o
          SET modifiers_total = (SELECT COALESCE(SUM(modifiers),0) FROM reservation_item WHERE order_id=o.id),
              price_subtotal = (SELECT COALESCE(SUM(price),0) FROM reservation_item WHERE order_id=o.id),
              total = (SELECT COALESCE(SUM(total),0) FROM reservation_item WHERE order_id=o.id) - discount_total
        WHERE o.id=$1`, [orderId]
    );

    await client.query('COMMIT');

    try {
      const html = buildItemModifiedHtml({ orderId: Number(orderId), from: it.old_code, to: newSeatCode, increment });
      await sendMailGeneric(req.user.email, 'Modificación de asiento', html);
    } catch (e) { console.error('Email item modified error:', e.message); }

    res.json({ ok: true, increment, from: it.old_code, to: newSeatCode });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

router.post('/:orderId/items/:itemId/cancel', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const { orderId, itemId } = req.params;
  const { cui } = req.body || {};
  if (!cui) return res.status(400).json({ ok: false, error: 'Falta CUI' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const row = await client.query(
      `SELECT ri.id, ri.order_id, ri.cui, ri.status, s.code as seat_code
         FROM reservation_item ri
         JOIN seat s ON s.id=ri.seat_id
        WHERE ri.id=$1 AND ri.order_id=$2`, [itemId, orderId]
    );
    if (!row.rowCount) throw new Error('Ítem no encontrado');
    const it = row.rows[0];
    if (it.status !== 'active') throw new Error('Ítem no activo');
    if (it.cui !== cui) throw new Error('CUI no coincide');

    await client.query(`UPDATE reservation_item SET status='canceled' WHERE id=$1`, [itemId]);
    await client.query(`INSERT INTO reservation_item_history(item_id, action, detail) VALUES ($1,'canceled',$2::jsonb)`, [itemId, JSON.stringify({ seatCode: it.seat_code })]);

    const left = await client.query(`SELECT COUNT(*)::int c FROM reservation_item WHERE order_id=$1 AND status='active'`, [orderId]);
    if (left.rows[0].c === 0) {
      await client.query(`UPDATE reservation_order SET status='canceled' WHERE id=$1`, [orderId]);
      await client.query(`INSERT INTO reservation_order_history(order_id, action, detail) VALUES ($1,'canceled','{}')`, [orderId]);
    }

    await client.query(
      `UPDATE reservation_order o
          SET modifiers_total = (SELECT COALESCE(SUM(modifiers),0) FROM reservation_item WHERE order_id=o.id),
              price_subtotal = (SELECT COALESCE(SUM(price),0) FROM reservation_item WHERE order_id=o.id AND status='active'),
              total = GREATEST(0,(SELECT COALESCE(SUM(total),0) FROM reservation_item WHERE order_id=o.id AND status='active') - discount_total)
        WHERE o.id=$1`, [orderId]
    );

    await client.query('COMMIT');

    try {
      const html = buildItemCanceledHtml({ orderId: Number(orderId), seatCode: it.seat_code });
      await sendMailGeneric(req.user.email, 'Cancelación de asiento', html);
    } catch (e) { console.error('Email item canceled error:', e.message); }

    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

router.post('/:orderId/cancel', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const { orderId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE reservation_item SET status='canceled' WHERE order_id=$1 AND status='active'`, [orderId]);
    await client.query(`UPDATE reservation_order SET status='canceled' WHERE id=$1`, [orderId]);
    await client.query(`INSERT INTO reservation_order_history(order_id, action, detail) VALUES ($1,'canceled','{}')`, [orderId]);
    await client.query('COMMIT');

    try {
      const html = buildOrderCanceledHtml({ orderId: Number(orderId) });
      await sendMailGeneric(req.user.email, 'Cancelación de reserva', html);
    } catch (e) { console.error('Email order canceled error:', e.message); }

    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ ok: false, error: e.message });
  } finally { client.release(); }
});

// GET /api/reservations/my
router.get('/my', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const userEmail = req.user?.email;

  if (!userEmail)
    return res.status(400).json({ ok: false, error: 'Falta autenticación' });

  try {
    // Obtener todas las órdenes del usuario
    const ordersRes = await pool.query(
      `SELECT id, user_email, mode, status, price_subtotal, discount_total, modifiers_total, total, reserved_at
         FROM reservation_order
        WHERE user_email=$1
        ORDER BY reserved_at DESC`,
      [userEmail]
    );

    const orderIds = ordersRes.rows.map((r) => r.id);
    let itemsRes = { rows: [] };

    if (orderIds.length) {
      itemsRes = await pool.query(
        `SELECT ri.id, ri.order_id, s.code AS seat_code, s.class AS seat_class,
                ri.passenger_name, ri.cui, ri.total, ri.status
           FROM reservation_item ri
           JOIN seat s ON s.id = ri.seat_id
          WHERE ri.order_id = ANY($1::int[])
          ORDER BY ri.id ASC`,
        [orderIds]
      );
    }

    res.json({
      ok: true,
      orders: ordersRes.rows,
      items: itemsRes.rows,
    });
  } catch (e) {
    console.error('GET /my error:', e.message);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
});


module.exports = router;