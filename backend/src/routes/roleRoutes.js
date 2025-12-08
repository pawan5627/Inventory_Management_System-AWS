const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const auth = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");

// only authenticated users with role 'role.create' can create roles
router.post("/", auth, requireRole("role.create"), roleController.createRole);
router.get("/", auth, requireRole("role.read"), roleController.listRoles);

module.exports = router;
