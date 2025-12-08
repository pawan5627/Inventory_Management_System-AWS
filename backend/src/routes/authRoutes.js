const express = require("express");
const router = express.Router();
const authController = require("../controllers/authContoller");

// login
router.post("/login", authController.login);

module.exports = router;
