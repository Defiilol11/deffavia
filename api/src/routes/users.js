const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { buildUserCreatedHtml, sendMailGeneric } = require('../mail-templates');

function validDomain(email) {
  return /@(gmail|outlook)\.com$/i.test(email);
}

router.post('/', async (req,res) => {
  const pool = req.app.get('db');
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok:false, error:'Faltan campos' });
  if (!validDomain(email)) return res.status(400).json({ ok:false, error:'Dominio no permitido' });

  try {
    const exists = await pool.query('SELECT 1 FROM app_user WHERE email=$1',[email]);
    if (exists.rowCount) return res.status(409).json({ ok:false, error:'Usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const ins = await pool.query(
      'INSERT INTO app_user(email,password_hash) VALUES ($1,$2) RETURNING id,email,created_at',
      [email, hash]
    );

    // Email de bienvenida
    try {
      const html = buildUserCreatedHtml({ email });
      await sendMailGeneric(email, 'Bienvenido/a', html);
    } catch (e) {
      console.error('Email userCreated falló:', e.message);
    }

    res.json({ ok:true, user: ins.rows[0] });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
});

module.exports = router;