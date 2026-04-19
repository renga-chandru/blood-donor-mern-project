const Donor = require('../models/Donor');

exports.addDonor = async (req, res) => {
    try {
        const existingDonor = await Donor.findOne({ userId: req.user.id });
        if (existingDonor) {
            return res.status(400).json({ message: 'You are already registered as a donor.' });
        }

        const { name, bloodGroup, phone, address, city, availability, lastDonatedDate } = req.body;
        const newDonor = new Donor({
            userId: req.user.id,
            name, bloodGroup, phone, address, city, availability, lastDonatedDate
        });
        await newDonor.save();
        res.status(201).json({ message: 'Donor registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.searchDonors = async (req, res) => {
    try {
        const { bloodGroup, city } = req.query;
        let query = { status: 'approved', isActive: true, availability: true };
        if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;
        if (city) query.city = new RegExp(city, 'i');
        
        let donors = await Donor.find(query);
        
        // 3-month gap normal eligibility check
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        donors = donors.map(donor => {
            const donorObj = donor.toObject();
            donorObj.isEligible = true;
            if (donor.lastDonatedDate && new Date(donor.lastDonatedDate) > threeMonthsAgo) {
                donorObj.isEligible = false;
            }
            
            // Privacy constraint: Hide contact info from public search
            delete donorObj.phone;
            delete donorObj.address;
            
            return donorObj;
        });

        res.status(200).json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.approveDonor = async (req, res) => {
    try {
        const donor = await Donor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!donor) return res.status(404).json({ message: 'Donor not found' });
        res.status(200).json({ message: 'Donor approved', donor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rejectDonor = async (req, res) => {
    try {
        const donor = await Donor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        if (!donor) return res.status(404).json({ message: 'Donor not found' });
        res.status(200).json({ message: 'Donor rejected', donor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllDonors = async (req, res) => {
    try {
        const donors = await Donor.find({}).sort({ createdAt: -1 });
        res.status(200).json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteDonor = async (req, res) => {
    try {
        const donor = await Donor.findByIdAndDelete(req.params.id);
        if (!donor) return res.status(404).json({ message: 'Donor not found' });
        res.status(200).json({ message: 'Donor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateDonorProfile = async (req, res) => {
    try {
        const { availability, lastDonatedDate } = req.body;
        const donor = await Donor.findOneAndUpdate(
            { userId: req.user.id },
            { availability, lastDonatedDate },
            { new: true }
        );
        if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
        res.status(200).json({ message: 'Donor profile updated', donor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.id });
        if (!donor) return res.status(404).json({ message: 'No donor profile found' });
        res.status(200).json(donor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rateDonor = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const donor = await Donor.findById(id);
        if (!donor) return res.status(404).json({ message: 'Donor not found' });

        // Simple average rating logic (or just update the field if we don't store multiple ratings)
        // For simplicity as per standard MERN student projects:
        donor.rating = rating; 
        await donor.save();

        res.status(200).json({ message: 'Rating submitted successfully', donor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const BloodRequest = require('../models/BloodRequest');
        const totalUsers = await User.countDocuments();
        const totalDonors = await Donor.countDocuments({ status: 'approved' });
        const totalRequests = await BloodRequest.countDocuments();
        
        res.status(200).json({ totalUsers, totalDonors, totalRequests });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
