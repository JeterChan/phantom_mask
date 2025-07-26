const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');

// Route to get transaction summary
router.get('/summary', transactionController.getTransactionSummary);

module.exports = router;