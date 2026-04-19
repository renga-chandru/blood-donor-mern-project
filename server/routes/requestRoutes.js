const express = require('express');
const router = express.Router();
const { 
    createRequest, getUserRequests, getAllRequests, 
    updateRequestStatus, getIncomingRequests, 
    respondToP2PRequest, triggerSOSAlert, completeRequest 
} = require('../controllers/requestController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/create', auth, createRequest);
router.post('/sos', auth, triggerSOSAlert);
router.get('/my', auth, getUserRequests);
router.get('/all', adminAuth, getAllRequests);
router.put('/status/:id', adminAuth, updateRequestStatus);
router.put('/complete/:id', auth, completeRequest);

// Directed P2P donor routes
router.get('/incoming', auth, getIncomingRequests);
router.put('/p2p-status/:id', auth, respondToP2PRequest);

module.exports = router;
