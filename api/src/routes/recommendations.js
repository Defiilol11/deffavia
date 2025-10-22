const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * GET /api/recommendations/seats?userEmail=xxx
 * Devuelve recomendaciones inteligentes de asientos basadas en el historial del usuario
 */
router.get('/seats', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const userEmail = req.query.userEmail || req.user?.email;

  if (!userEmail) {
    return res.status(400).json({ ok: false, error: 'Falta userEmail' });
  }

  try {
    // 1. Encontrar clase favorita del usuario
    const favoriteClassQuery = await pool.query(`
      SELECT s.class, COUNT(*)::int as count
      FROM reservation_item ri
      JOIN reservation_order ro ON ro.id = ri.order_id
      JOIN seat s ON s.id = ri.seat_id
      WHERE ro.user_email = $1 AND ri.status = 'active'
      GROUP BY s.class
      ORDER BY count DESC
      LIMIT 1
    `, [userEmail]);

    const favoriteClass = favoriteClassQuery.rows[0]?.class || null;
    const classCount = favoriteClassQuery.rows[0]?.count || 0;

    // 2. Encontrar asientos más reservados por el usuario (histórico)
    const favoriteSeatQuery = await pool.query(`
      SELECT s.code, s.class, COUNT(*)::int as times_reserved
      FROM reservation_item ri
      JOIN reservation_order ro ON ro.id = ri.order_id
      JOIN seat s ON s.id = ri.seat_id
      WHERE ro.user_email = $1
      GROUP BY s.code, s.class
      ORDER BY times_reserved DESC, s.code ASC
      LIMIT 5
    `, [userEmail]);

    const favoriteSeats = favoriteSeatQuery.rows;

    // 3. Encontrar filas favoritas (extraer letra del código)
    const favoriteRows = [...new Set(favoriteSeats.map(s => s.code.charAt(0)))];

    // 4. Sugerir asientos similares disponibles (misma clase y filas favoritas)
    let suggestedSeats = [];
    if (favoriteClass && favoriteRows.length > 0) {
      const suggestedQuery = await pool.query(`
        SELECT s.code, s.class
        FROM seat s
        WHERE s.class = $1
          AND LEFT(s.code, 1) = ANY($2::text[])
          AND NOT EXISTS (
            SELECT 1 FROM reservation_item ri
            WHERE ri.seat_id = s.id AND ri.status = 'active'
          )
        ORDER BY s.code ASC
        LIMIT 5
      `, [favoriteClass, favoriteRows]);

      suggestedSeats = suggestedQuery.rows;
    }

    // 5. Encontrar asientos más populares globalmente (todos los usuarios)
    const popularSeatsQuery = await pool.query(`
      SELECT s.code, s.class, COUNT(*)::int as reservations
      FROM reservation_item ri
      JOIN seat s ON s.id = ri.seat_id
      GROUP BY s.code, s.class
      ORDER BY reservations DESC
      LIMIT 5
    `);

    const popularSeats = popularSeatsQuery.rows;

    // 6. Generar razonamiento
    let reasoning = 'No tienes historial de reservas aún.';
    if (classCount > 0) {
      reasoning = `Basado en tus ${classCount} reserva${classCount > 1 ? 's' : ''} en clase ${favoriteClass === 'business' ? 'Business' : 'Economy'}`;
      if (favoriteSeats.length > 0) {
        reasoning += `, tu asiento favorito es ${favoriteSeats[0].code}`;
      }
    }

    res.json({
      ok: true,
      recommendations: {
        favoriteClass,
        favoriteSeats: favoriteSeats.map(s => ({
          code: s.code,
          class: s.class,
          timesReserved: s.times_reserved
        })),
        suggestedSeats: suggestedSeats.map(s => ({
          code: s.code,
          class: s.class,
          available: true
        })),
        popularSeats: popularSeats.map(s => ({
          code: s.code,
          class: s.class,
          totalReservations: s.reservations
        })),
        reasoning
      }
    });

  } catch (e) {
    console.error('Error en recomendaciones:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
