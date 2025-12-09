const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const auth = require("../middlewares/authMiddleware");

// Get current user's profile
router.get("/", auth, profileController.getProfile);

// Update current user's profile
router.put("/", auth, profileController.updateProfile);

// Get presigned URL to upload avatar
router.get("/avatar/upload-url", auth, profileController.getAvatarUploadUrl);

// Set avatar (persist S3 key to users.avatar_url)
router.put("/avatar", auth, profileController.setAvatar);

module.exports = router;
