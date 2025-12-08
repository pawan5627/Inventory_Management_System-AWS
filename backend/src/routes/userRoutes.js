
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");

// Sign up might be public or restricted; here we allow admin to create users
router.post("/", auth, requireRole("user.create"), userController.createUser);
router.get("/", auth, requireRole("user.read"), userController.listUsers);
router.put("/:id/groups", auth, requireRole("user.update"), userController.addGroups);

module.exports = router;
