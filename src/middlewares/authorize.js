export default function authorize(requiredRoles = []) {
  return (req, res, next) => {
    if (!req.userRoles) return res.status(401).json({ message: 'No autorizado' });
    if (requiredRoles.length && !requiredRoles.some(role => req.userRoles.includes(role))) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}
