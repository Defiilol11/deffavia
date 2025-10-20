const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req,res) => {
  const pool = req.app.get('db');
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok:false, error:'Faltan campos' });

  const row = await pool.query('SELECT id,email,password_hash FROM app_user WHERE email=$1',[email]);
  if (!row.rowCount) return res.status(401).json({ ok:false, error:'Credenciales' });

  const match = await bcrypt.compare(password, row.rows[0].password_hash);
  if (!match) return res.status(401).json({ ok:false, error:'Credenciales' });

  // VIP flag
  const vipRow = await pool.query(
    `SELECT COUNT(*)::int c FROM reservation WHERE user_email=$1 AND status='active'`,
    [email]
  );
  const isVip = vipRow.rows[0].c > 5;

  const token = jwt.sign({ sub: row.rows[0].id, email }, process.env.JWT_SECRET || 'devsecret', { expiresIn:'8h' });
  res.json({ ok:true, token, user:{ id: row.rows[0].id, email, isVip } });
});

module.exports = router;