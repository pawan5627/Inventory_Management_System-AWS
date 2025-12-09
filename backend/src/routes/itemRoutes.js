const express = require('express');
const router = express.Router();
const { listItems, createItem } = require('../controllers/itemController');

// TODO: add auth middleware when JWT is wired
router.get('/', listItems);
router.post('/', createItem);

module.exports = router;
