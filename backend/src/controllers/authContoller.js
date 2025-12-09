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

const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ 
      message: "User created successfully", 
      user 
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Signup failed" });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const result = await authService.forgotPassword(email);
    
    // In production, send email here with reset link
    // For now, we'll return the token in response (NOT for production!)
    const resetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.json({ 
      message: result.message,
      // Remove resetLink from production
      resetLink: `${resetUrl}?page=reset&token=${result.resetToken}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to process request" });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || "Password reset failed" });
  }
};

module.exports = { login, signup, forgotPassword, resetPassword };
