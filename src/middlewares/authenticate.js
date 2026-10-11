import jwt from 'jsonwebtoken';

export default function authenticate(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ message: 'No autorizado' });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRoles = payload.roles || [];
    next();
  } catch {
    res.status(401).json({ message: 'Token no válido o caducado' });
  }
}
