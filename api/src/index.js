require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Routers
const filesRouter = require('./files');
const mailRouter = require('./mail');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const reservationsRouter = require('./routes/reservations');
const reportsRouter = require('./reports');

// Swagger
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

const origins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5433),
  database: process.env.PGDATABASE || 'deffavia',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres'
});
app.set('db', pool);

// Health
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok:true }); }
  catch (e) { res.status(500).json({ ok:false, error:e.message }); }
});

// Seed asientos
function generateAllSeats() {
  const businessRows = ['I','G','F','D','C','A'];
  const businessCols = [1,2];
  const economyRows  = ['I','H','G','F','E','D','C','B','A'];
  const economyCols  = [3,4,5,6,7];
  const seats = [];
  for (const r of businessRows) for (const c of businessCols) seats.push({ code: `${r}${c}`, class: 'business' });
  for (const r of economyRows)  for (const c of economyCols)  seats.push({ code: `${r}${c}`, class: 'economy' });
  return seats;
}
app.post('/api/admin/seed-seats', async (_req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const seats = generateAllSeats();
    for (const s of seats) {
      await client.query('INSERT INTO seat(code, class) VALUES ($1,$2) ON CONFLICT (code) DO NOTHING', [s.code, s.class]);
    }
    await client.query('COMMIT');
    res.json({ ok:true, insertedOrExisting: seats.length });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok:false, error:e.message });
  } finally { client.release(); }
});

// Seats usando vista v_seat_occupancy
app.get('/api/seats', async (req, res) => {
  try {
    const seatClass = req.query.class || null;
    const q = `
      SELECT id, code, class, seat_status
      FROM v_seat_occupancy
      WHERE ($1::text IS NULL OR class = $1)
      ORDER BY class, code DESC
    `;
    const { rows } = await pool.query(q, [seatClass]);
    res.json(rows);
  } catch (e) { res.status(500).json({ ok:false, error:e.message }); }
});

// Routers
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/files', filesRouter);
app.use('/api/mail', mailRouter);
app.use('/api/reports', reportsRouter);

// Swagger UI (/api/docs)
try {
  const openapi = yaml.load(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  console.log('Swagger UI disponible en /api/docs');
} catch (e) {
  console.warn('No se pudo cargar openapi.yaml:', e.message);
}

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));