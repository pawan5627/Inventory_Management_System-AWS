const jwt = require("jsonwebtoken");
const userService = require("./userService");
const bcrypt = require("bcryptjs");

const login = async (username, password) => {
  const user = await userService.findByUsername(username);
  if (!user) throw new Error("Invalid credentials");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  // derive roles (flatten)
  const roleNames = new Set();
  if (user.groups && user.groups.length) {
    user.groups.forEach(g => {
      if (g.roles && g.roles.length) {
        g.roles.forEach(r => roleNames.add(r.name));
      }
    });
  }

  const payload = {
    sub: String(user.id),
    username: user.username,
    roles: Array.from(roleNames),
    companyId: null
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  return { token, user: { id: user.id, username: user.username, roles: payload.roles } };
};

module.exports = { login };
