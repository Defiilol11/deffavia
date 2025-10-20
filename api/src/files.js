const express = require('express');
const multer = require('multer');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

function seatClassFromCode(code) {
  const match = String(code).match(/^([A-IH])(\d+)$/i); // filas A..I (incluye H)
  if (!match) return null;
  const col = Number(match[2]);
  if (col >= 1 && col <= 2) return 'business';
  if (col >= 3 && col <= 7) return 'economy';
  return null;
}

async function ensureSeat(pool, code) {
  const seatClass = seatClassFromCode(code);
  if (!seatClass) throw new Error(`seatNumber inválido: ${code}`);
  const q = await pool.query('SELECT id FROM seat WHERE code=$1', [code]);
  if (q.rowCount) return q.rows[0].id;
  const ins = await pool.query('INSERT INTO seat(code, class) VALUES ($1,$2) RETURNING id', [code, seatClass]);
  return ins.rows[0].id;
}

function parseDate(ddmmyyyy_hhmm) {
  // dd/MM/YYYY HH:mm -> ISO
  const s = String(ddmmyyyy_hhmm || '').trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [_, dd, MM, yyyy, hh, mm] = m.map(Number);
  const iso = new Date(Date.UTC(yyyy, MM - 1, dd, hh, mm, 0));
  return isNaN(iso.getTime()) ? null : iso.toISOString();
}

function basePrice(cls) {
  return cls === 'business' ? Number(process.env.PRICE_BUSINESS || 1200) : Number(process.env.PRICE_ECONOMY || 600);
}

// GET /files/export-xml -> exporta ítems activos
router.get('/export-xml', async (req, res) => {
  const pool = req.app.get('db');
  try {
    const { rows } = await pool.query(`
      SELECT s.code AS seat_code, ri.passenger_name, ro.user_email, ri.cui, ri.has_luggage, ro.reserved_at
      FROM reservation_item ri
      JOIN reservation_order ro ON ro.id = ri.order_id
      JOIN seat s ON s.id = ri.seat_id
      WHERE ro.status = 'active' AND ri.status = 'active'
      ORDER BY ro.reserved_at DESC, ri.id ASC
    `);

    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const obj = {
      flightReservation: {
        flightSeat: rows.map(r => ({
          seatNumber: r.seat_code,
          passengerName: r.passenger_name,
          user: r.user_email,
          idNumber: r.cui,
          hasLuggage: String(!!r.has_luggage),
          reservationDate: new Date(r.reserved_at).toLocaleString('es-GT', { hour12: false })
        }))
      }
    };
    const xml = builder.build(obj);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="reservas-${Date.now()}.xml"`);
    res.send(xml);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /files/import-xml
// - Agrupa por user + reservationDate en una sola orden (mode='imported')
// - Continúa ante errores; valida asiento libre; mide tiempo
router.post('/import-xml', upload.single('file'), async (req, res) => {
  const pool = req.app.get('db');
  const start = process.hrtime.bigint();

  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ ok: false, error: 'Archivo XML no recibido.' });
    }

    const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true, trimValues: true });
    const parsed = parser.parse(req.file.buffer.toString('utf8'));
    let items = parsed?.flightReservation?.flightSeat;
    if (!items) {
      const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
      return res.json({ ok: true, readCount: 0, successCount: 0, errorCount: 0, elapsedMs, errors: [] });
    }
    if (!Array.isArray(items)) items = [items];

    // seed opcional si seat está vacío (igual que tu /api/admin/seed-seats)
    const seatCount = (await pool.query('SELECT COUNT(*)::int c FROM seat')).rows[0].c;
    if (seatCount === 0) {
      const businessRows = ['I','G','F','D','C','A'];
      const businessCols = [1,2];
      const economyRows  = ['I','H','G','F','E','D','C','B','A'];
      const economyCols  = [3,4,5,6,7];
      for (const r of businessRows) for (const c of businessCols)
        await pool.query('INSERT INTO seat(code, class) VALUES ($1,$2) ON CONFLICT (code) DO NOTHING', [`${r}${c}`, 'business']);
      for (const r of economyRows)  for (const c of economyCols)
        await pool.query('INSERT INTO seat(code, class) VALUES ($1,$2) ON CONFLICT (code) DO NOTHING', [`${r}${c}`, 'economy']);
    }

    // Agrupar por user+fecha
    const groups = new Map(); // key -> array
    let readCount = 0;
    for (const it of items) {
      readCount++;
      const seatNumber = String(it.seatNumber || '').trim();
      const passengerName = String(it.passengerName || '').trim();
      const userEmail = String(it.user || '').trim();
      const cui = String(it.idNumber || '').trim();
      const hasLuggage = /^true$/i.test(String(it.hasLuggage));
      const reservationDate = String(it.reservationDate || '').trim();
      const key = `${userEmail}|${reservationDate}`;

      if (!seatNumber || !passengerName || !userEmail || !cui) {
        const arr = groups.get('__errors__') || [];
        arr.push({ index: readCount, seatCode: seatNumber, cui, message: 'Campos obligatorios faltantes' });
        groups.set('__errors__', arr);
        continue;
      }
      (groups.get(key) || groups.set(key, []).get(key)).push({ seatNumber, passengerName, userEmail, cui, hasLuggage, reservationDate });
    }

    const errors = groups.get('__errors__') || [];
    groups.delete('__errors__');

    let successCount = 0;
    let errorCount = errors.length;

    // Procesar cada grupo en transacción
    for (const [key, arr] of groups.entries()) {
      const [userEmail, dateStr] = key.split('|');
      const reservedAtIso = parseDate(dateStr) || null;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // VIP por órdenes activas previas
        const vipRow = await client.query(
          "SELECT COUNT(*)::int c FROM reservation_order WHERE user_email=$1 AND status='active'",
          [userEmail]
        );
        const isVip = vipRow.rows[0].c > 5;

        const prepared = [];
        let subtotal = 0;

        for (const it of arr) {
          // asegurar seat
          let seatId;
          try {
            seatId = await ensureSeat(client, it.seatNumber);
          } catch (e) {
            errorCount++; errors.push({ seatCode: it.seatNumber, cui: it.cui, message: e.message });
            continue;
          }

          // libre?
          const occ = await client.query(
            `SELECT 1 FROM reservation_item WHERE seat_id=$1 AND status='active' LIMIT 1`,
            [seatId]
          );
          if (occ.rowCount) {
            errorCount++; errors.push({ seatCode: it.seatNumber, cui: it.cui, message: 'Asiento ocupado' });
            continue;
          }

          const cls = seatClassFromCode(it.seatNumber);
          const price = basePrice(cls);
          subtotal += price;
          prepared.push({
            seatId, seatCode: it.seatNumber, seatClass: cls,
            passengerName: it.passengerName, cui: it.cui, hasLuggage: it.hasLuggage, price
          });
        }

        if (!prepared.length) { await client.query('ROLLBACK'); continue; }

        const discountTotal = isVip ? +(subtotal * 0.10).toFixed(2) : 0;
        const orderTotal = +(subtotal - discountTotal).toFixed(2);

        const insOrder = await client.query(
          `INSERT INTO reservation_order(user_id, user_email, mode, status, price_subtotal, discount_total, modifiers_total, total, reserved_at)
           VALUES (NULL,$1,'imported','active',$2,$3,0,$4,COALESCE($5,NOW()))
           RETURNING id`,
          [userEmail, subtotal, discountTotal, orderTotal, reservedAtIso]
        );
        const orderId = insOrder.rows[0].id;

        for (const it of prepared) {
          const insItem = await client.query(
            `INSERT INTO reservation_item(order_id, seat_id, passenger_name, cui, has_luggage, price, modifiers, discount, total, status, modified_count, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,0,0,$6,'active',0,COALESCE($7,NOW()))
             ON CONFLICT DO NOTHING
             RETURNING id`,
            [orderId, it.seatId, it.passengerName, it.cui, it.hasLuggage, it.price, reservedAtIso]
          );
          if (!insItem.rowCount) {
            errorCount++; errors.push({ seatCode: it.seatCode, cui: it.cui, message: 'Conflicto de ocupación' });
            continue;
          }
          successCount++;
          await client.query(
            `INSERT INTO reservation_item_history(item_id, action, detail) VALUES ($1,'imported',$2::jsonb)`,
            [insItem.rows[0].id, JSON.stringify({ seatCode: it.seatCode })]
          );
        }

        // Recalcular totales por si algún ítem falló
        await client.query(
          `UPDATE reservation_order o
              SET price_subtotal = (SELECT COALESCE(SUM(price),0) FROM reservation_item WHERE order_id=o.id),
                  modifiers_total = (SELECT COALESCE(SUM(modifiers),0) FROM reservation_item WHERE order_id=o.id),
                  total = (SELECT COALESCE(SUM(total),0) FROM reservation_item WHERE order_id=o.id) - discount_total
            WHERE o.id=$1`,
          [orderId]
        );

        await client.query(
          `INSERT INTO reservation_order_history(order_id, action, detail) VALUES ($1,'created',$2::jsonb)`,
          [orderId, JSON.stringify({ imported: true })]
        );

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        errorCount++; errors.push({ message: `Error al crear orden importada: ${e.message}` });
      } finally {
        client.release();
      }
    }

    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    res.json({ ok: true, readCount, successCount, errorCount, elapsedMs, errors });
  } catch (e) {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    res.status(500).json({ ok: false, error: e.message, elapsedMs });
  }
});

module.exports = router;