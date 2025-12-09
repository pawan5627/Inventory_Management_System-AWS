const authService = require("../services/authService");
const userService = require("../services/userService");

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

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
    const username = (email || '').split('@')[0];
    const created = await userService.createUser({ username, email, password, name, status: 'Active' });
    // assign default group 'employees' if exists
    try {
      const { getPool } = require('../config/db');
      const pool = getPool();
      const gr = await pool.query(`SELECT id FROM groups WHERE name = $1 LIMIT 1`, ['employees']);
      if (gr.rows[0]?.id) {
        await userService.addGroupsToUser(created.id, [gr.rows[0].id]);
      }
    } catch (e) { /* ignore */ }
    res.status(201).json({ id: created.id, email: created.email, username: created.username, name: created.name });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Signup failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const url = await authService.createPasswordReset(email);
    res.json({ resetUrl: url });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to initiate reset' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'token and password are required' });
    await authService.resetPasswordWithToken(token, password);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to reset password' });
  }
};

module.exports.signup = signup;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
