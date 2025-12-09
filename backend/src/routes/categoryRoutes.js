const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");

// List categories
router.get("/", auth, requireRole("group.read"), categoryController.listCategories);

// Create category (ID and name)
router.post("/", auth, requireRole("group.create"), categoryController.createCategory);

// Update category
router.put("/:id", auth, requireRole("group.update"), categoryController.updateCategory);

module.exports = router;
