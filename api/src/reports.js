const express = require('express');
const router = express.Router();

router.get('/summary', async (req, res) => {
  const pool = req.app.get('db');
  try {
    const users = (await pool.query('SELECT COUNT(*)::int c FROM app_user')).rows[0].c;

    // Ocupación por clase desde la vista
    const classRows = (await pool.query('SELECT class, occupied::int, free::int FROM v_seat_class_counts')).rows;
    const byClass = Object.fromEntries(classRows.map(r => [r.class, r]));

    // Conteo por modo (manual/random/imported)
    const modes = (await pool.query('SELECT mode, COUNT(*)::int orders_count FROM reservation_order GROUP BY mode')).rows;
    const byMode = Object.fromEntries(modes.map(r => [r.mode, r.orders_count]));

    // Modificados y cancelados (ítems)
    const itemStats = (await pool.query(`
      SELECT
        SUM(CASE WHEN modified_count > 0 THEN 1 ELSE 0 END)::int AS modified_items,
        SUM(CASE WHEN status='canceled' THEN 1 ELSE 0 END)::int AS canceled_items
      FROM reservation_item
    `)).rows[0] || { modified_items: 0, canceled_items: 0 };

    // Reservas (órdenes) por usuario
    const ordersByUser = (await pool.query(`
      SELECT user_email, COUNT(*)::int AS orders_count
      FROM reservation_order
      GROUP BY user_email
      ORDER BY orders_count DESC, user_email ASC
    `)).rows;

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
      reservasPorUsuario: ordersByUser
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;