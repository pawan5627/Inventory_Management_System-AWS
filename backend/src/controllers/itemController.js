const itemService = require("../services/itemService");

const listItems = async (req, res) => {
  try {
    const items = await itemService.listItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list items' });
  }
};

const createItem = async (req, res) => {
  try {
    const created = await itemService.createItem(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create item' });
  }
};

module.exports = { listItems, createItem };
