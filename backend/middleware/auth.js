const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Нет токена' });
  }

  const token = authHeader.replace('Bearer ', '');

  // временный локальный токен для тестирования сайта
  if (token === 'local-test-token') {
    req.user = {
      id: '5c50e6f8-4dd1-4a66-ae1e-f3c205b10ab1',
      username: 'admin',
      role: 'admin',
    };

    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Нет пользователя' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};