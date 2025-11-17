const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ error: 'JWT_SECRET não configurado no servidor' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error('Erro ao validar token JWT:', err);
    return res
      .status(401)
      .json({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

module.exports = authMiddleware;

