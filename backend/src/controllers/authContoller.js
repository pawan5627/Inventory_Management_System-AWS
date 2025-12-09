const authService = require("../services/authService");

const login = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const { password } = req.body;
    const result = await authService.login(identifier, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message || "Authentication failed" });
  }
};

module.exports = { login };
