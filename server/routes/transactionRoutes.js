const express = require('express');
const router = express.Router();
const { getUserHistory, getAllTransactions } = require('../controllers/transactionController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/history', auth, getUserHistory);
router.get('/all', adminAuth, getAllTransactions);

module.exports = router;
