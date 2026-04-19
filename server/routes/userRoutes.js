const express = require('express');
const router = express.Router();
const { searchUsers, getAllUsers, adminResetPassword } = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/search', auth, searchUsers);
router.get('/all', adminAuth, getAllUsers);
router.put('/reset-password/:id', adminAuth, adminResetPassword);


module.exports = router;
