const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");

router.post("/", auth, requireRole("group.create"), groupController.createGroup);
router.get("/", auth, requireRole("group.read"), groupController.listGroups);
router.put("/:id/roles", auth, requireRole("group.update"), groupController.addRoles);

module.exports = router;
