/**
 * Manejador centralizado de errores.
 * Usa next(err) en tus routers para llegar aquí.
 */
module.exports = function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err);
  if (res.headersSent) return;
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.publicMessage || err.message || 'Error interno'
  });
};