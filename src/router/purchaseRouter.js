const express = require('express');
const router = express.Router();
const purchaseController = require('../controller/purchaseController');

// POST: /purchase
router.post('/', purchaseController.purchaseMask);

module.exports = router;