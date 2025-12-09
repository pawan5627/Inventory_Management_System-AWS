const express = require('express');
const router = express.Router();
const { listItems, createItem, updateItem } = require('../controllers/itemController');

// TODO: add auth middleware when JWT is wired
router.get('/', listItems);
router.post('/', createItem);
router.put('/:id', updateItem);

module.exports = router;
