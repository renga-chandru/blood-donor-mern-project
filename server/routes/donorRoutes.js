const express = require('express');
const router = express.Router();
const { addDonor, searchDonors, approveDonor, rejectDonor, deleteDonor, updateDonorProfile, getStats, getMyProfile, getAllDonors, rateDonor } = require('../controllers/donorController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/add', auth, addDonor);
router.get('/search', searchDonors);
router.get('/all', adminAuth, getAllDonors);
router.get('/me', auth, getMyProfile);
router.put('/approve/:id', adminAuth, approveDonor);
router.put('/reject/:id', adminAuth, rejectDonor);
router.delete('/delete/:id', adminAuth, deleteDonor);
router.post('/rate/:id', auth, rateDonor);
router.put('/update-profile', auth, updateDonorProfile);
router.get('/stats', auth, getStats);

module.exports = router;
