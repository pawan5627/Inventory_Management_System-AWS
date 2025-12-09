const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const auth = require("../middlewares/authMiddleware");

// Get current user's profile
router.get("/", auth, profileController.getProfile);

// Update current user's profile
router.put("/", auth, profileController.updateProfile);

module.exports = router;
