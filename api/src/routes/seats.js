const express = require('express');
const router = express.Router();

function basePrice(cls) {
  return cls === 'business' ? Number(process.env.PRICE_BUSINESS || 1200)
    : Number(process.env.PRICE_ECONOMY || 600);
}

/**
 * GET /api/seats/contiguous?class=business&count=5
 * Devuelve opciones de asientos contiguos disponibles
 */
router.get('/contiguous', async (req, res) => {
  const pool = req.app.get('db');
  const seatClass = req.query.class;
  const count = Number(req.query.count || 0);

  if (!seatClass || (seatClass !== 'business' && seatClass !== 'economy')) {
    return res.status(400).json({ ok: false, error: 'Clase inválida (business|economy)' });
  }

  if (count < 2) {
    return res.status(400).json({ ok: false, error: 'count debe ser al menos 2' });
  }

  try {
    // Buscar filas con suficientes asientos disponibles consecutivos
    const rowsQuery = await pool.query(`
      SELECT LEFT(s.code, 1) as row_letter,
             ARRAY_AGG(s.code ORDER BY s.code) as seat_codes,
             COUNT(*)::int as available_count
      FROM seat s
      WHERE s.class = $1
        AND NOT EXISTS (
          SELECT 1 FROM reservation_item ri
          WHERE ri.seat_id = s.id AND ri.status = 'active'
        )
      GROUP BY LEFT(s.code, 1)
      HAVING COUNT(*) >= $2
      ORDER BY row_letter
    `, [seatClass, count]);

    const options = [];
    const pricePerSeat = basePrice(seatClass);

    for (const row of rowsQuery.rows) {
      // Tomar los primeros N asientos de cada fila
      const seats = row.seat_codes.slice(0, count);
      options.push({
        row: row.row_letter,
        seats,
        totalSeatsAvailable: row.available_count,
        pricePerSeat,
        totalPrice: pricePerSeat * count
      });
    }

    res.json({
      ok: true,
      available: options.length > 0,
      count: options.length,
      options
    });

  } catch (e) {
    console.error('Error al buscar asientos contiguos:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
