const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    // attach user info minimally
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
