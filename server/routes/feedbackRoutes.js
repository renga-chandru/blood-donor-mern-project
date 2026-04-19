const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/submit', auth, submitFeedback);
router.get('/all', adminAuth, getAllFeedback);

module.exports = router;
