const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');

// Trigger emergency SOS alert
exports.triggerSOSAlert = async (req, res) => {
    try {
        const { bloodGroup, city, message } = req.body;
        const io = req.app.get('io');
        
        const sosData = {
            bloodGroup,
            city,
            message: message || `EMERGENCY: ${bloodGroup} needed immediately in ${city}!`,
            senderName: req.user.name,
            senderPhone: req.user.phone, // Added for immediate contact
            timestamp: new Date()
        };

        if(io) {
            io.emit('sosAlert', sosData);
        }

        res.status(200).json({ message: 'SOS Alert broadcasted successfully', data: sosData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark a request as Completed (The Hero Moment)
exports.completeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await BloodRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.status === 'Completed') {
            return res.status(400).json({ message: 'Request already marked as completed' });
        }

        request.status = 'Completed';
        await request.save();

        // Increment donor's donation count, update lastDonatedDate, and set availability to false
        if (request.recipientId) {
            const donor = await Donor.findOne({ userId: request.recipientId });
            if (donor) {
              donor.donationsCount = (donor.donationsCount || 0) + 1;
              donor.lastDonatedDate = new Date();
              donor.availability = false; // LOOPHOLE FIX: Force rest period
              await donor.save();
            }
        }

        const io = req.app.get('io');
        if(io) {
            io.emit('requestStatusUpdated', request);
        }

        res.status(200).json({ message: 'Request marked as completed. Life saved!', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User creates a directed P2P request
exports.createRequest = async (req, res) => {
    try {
        const { bloodGroup, requestType, urgency, quantity, recipientId } = req.body;
        
        // recipientId must be the User ID of the donor
        const newRequest = new BloodRequest({
            userId: req.user.id,
            bloodGroup,
            requestType,
            urgency,
            quantity,
            recipientId: recipientId || null
        });
        await newRequest.save();

        const io = req.app.get('io');
        if(io) {
            io.emit('newBloodRequest', newRequest);
        }

        res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Requester (Siva) gets their own sent requests
exports.getUserRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find({ userId: req.user.id })
            .populate('recipientId', 'name email phone bloodGroup city') // Populate donor details
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin gets all requests for the log
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find()
            .populate('userId', 'name email')
            .populate('recipientId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin updates status (not used in P2P flow but kept for emergencies)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await BloodRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await request.save();

        res.status(200).json({ message: `Request ${status.toLowerCase()} successfully`, request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Donor (Chandru) gets requests directed to his User ID
exports.getIncomingRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find({ recipientId: req.user.id })
            .populate('userId', 'name email phone bloodGroup city') // Populate requester details
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Donor (Chandru) responds to the request
exports.respondToP2PRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if(!['Approved', 'Rejected'].includes(status)) {
             return res.status(400).json({ message: 'Invalid status' });
        }

        // Search by request ID and recipient ID (Donor's User account ID)
        const request = await BloodRequest.findOne({ _id: id, recipientId: req.user.id });
        if (!request) return res.status(404).json({ message: 'Request not found or not directed to your account.' });

        request.status = status;
        await request.save();

        const io = req.app.get('io');
        if(io) {
            io.emit('requestStatusUpdated', request);
        }

        res.status(200).json({ message: `You have ${status.toLowerCase()} the request.`, request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
