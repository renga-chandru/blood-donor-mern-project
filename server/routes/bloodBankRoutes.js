const express = require('express');
const router = express.Router();
const { addBloodBank, getBloodBanks, updateBloodBank, deleteBloodBank } = require('../controllers/bloodBankController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/all', auth, getBloodBanks);
router.post('/add', adminAuth, addBloodBank);
router.put('/update/:id', adminAuth, updateBloodBank);
router.delete('/delete/:id', adminAuth, deleteBloodBank);

module.exports = router;
