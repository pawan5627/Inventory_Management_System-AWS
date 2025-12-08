const categoryService = require("../services/categoryService");

const listCategories = async (req, res) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!name) return res.status(400).json({ message: "category name is required" });
    const created = await categoryService.createCategory({ id, name });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create category" });
  }
};

module.exports = { listCategories, createCategory };
