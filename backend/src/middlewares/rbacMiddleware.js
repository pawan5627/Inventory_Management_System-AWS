// usage: requireRole('product.create')
const requireRole = (required) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const roles = req.user.roles || [];
    if (roles.includes(required)) return next();
    return res.status(403).json({ message: "Forbidden: missing permission " + required });
  };
};

module.exports = { requireRole };
