const authService = require("../services/authService");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message || "Authentication failed" });
  }
};

module.exports = { login };
