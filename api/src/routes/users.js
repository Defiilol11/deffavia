const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { buildUserCreatedHtml, sendMailGeneric } = require('../mail-templates');
const auth = require('../middleware/auth');

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

// PATCH /api/users/:id - Actualizar usuario (email y/o password)
router.patch('/:id', auth(true), async (req, res) => {
  const pool = req.app.get('db');
  const { id } = req.params;
  const { email, password, currentPassword } = req.body || {};

  // Validar que el usuario solo pueda editar su propio perfil
  if (Number(id) !== req.user.id) {
    return res.status(403).json({ ok: false, error: 'No autorizado para editar este usuario' });
  }

  // Al menos un campo debe ser proporcionado
  if (!email && !password) {
    return res.status(400).json({ ok: false, error: 'Debe proporcionar email o password para actualizar' });
  }

  try {
    // Verificar que el usuario existe
    const userRow = await pool.query(
      'SELECT id, email, password_hash FROM app_user WHERE id=$1',
      [id]
    );

    if (!userRow.rowCount) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    const currentUser = userRow.rows[0];

    // Si se va a cambiar el password, verificar password actual
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ ok: false, error: 'Debe proporcionar currentPassword para cambiar la contraseña' });
      }

      const isMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!isMatch) {
        return res.status(401).json({ ok: false, error: 'Contraseña actual incorrecta' });
      }
    }

    // Validar email si se proporciona
    if (email) {
      if (!validDomain(email)) {
        return res.status(400).json({ ok: false, error: 'Dominio no permitido' });
      }

      // Verificar que el nuevo email no esté en uso (si es diferente al actual)
      if (email !== currentUser.email) {
        const emailExists = await pool.query(
          'SELECT 1 FROM app_user WHERE email=$1 AND id != $2',
          [email, id]
        );
        if (emailExists.rowCount) {
          return res.status(409).json({ ok: false, error: 'El email ya está en uso' });
        }
      }
    }

    // Construir la query de actualización dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount}`);
      values.push(hash);
      paramCount++;
    }

    // Agregar el ID al final de los valores
    values.push(id);

    const updateQuery = `
      UPDATE app_user
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, created_at
    `;

    const result = await pool.query(updateQuery, values);

    res.json({
      ok: true,
      user: result.rows[0],
      updated: {
        email: !!email,
        password: !!password
      }
    });

  } catch (e) {
    console.error('Error al actualizar usuario:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
