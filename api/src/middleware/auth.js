const jwt = require('jsonwebtoken');

module.exports = (requireAuth = true) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (requireAuth) return res.status(401).json({ ok:false, error:'Falta token' });
      else return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      req.user = { id: decoded.sub, email: decoded.email };
      next();
    } catch (err) {
      if (requireAuth) return res.status(401).json({ ok:false, error:'Token inválido o expirado' });
      else next();
    }
  };
};
