const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

// GET: /api/v1/users/top-by-transactions?startDate=2023-01-01&endDate=2023-12-31&limit=10
router.get('/top-by-transactions', userController.getTopUsersByTransactions);

module.exports = router;