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
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ message: "category name is required" });
    const created = await categoryService.createCategory({ name, description, status });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updated = await categoryService.updateCategory(req.params.id, { name, description, status });
    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update category" });
  }
};

module.exports = { listCategories, createCategory, updateCategory };
