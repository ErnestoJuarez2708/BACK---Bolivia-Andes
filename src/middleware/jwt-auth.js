const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'No token proporcionado' });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (err) {
    console.error('Error en auth middleware:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};