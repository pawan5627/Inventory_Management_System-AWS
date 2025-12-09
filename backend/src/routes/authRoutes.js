const express = require("express");
const router = express.Router();
const authController = require("../controllers/authContoller");

// login
router.post("/login", authController.login);

// public signup (assigns default group)
router.post("/signup", authController.signup);

// password reset flows
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
