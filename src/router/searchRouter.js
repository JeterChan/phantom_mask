const express = require('express');
const router = express.Router();
const searchController = require('../controller/searchController');

// search endpoint
router.get('/', searchController.search);

module.exports = router;