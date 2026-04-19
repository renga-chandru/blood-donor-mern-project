const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Search for users by blood group and city (P2P)
exports.searchUsers = async (req, res) => {
    try {
        const { bloodGroup, city } = req.query;
        let query = {};
        
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (city) query.city = { $regex: city, $options: 'i' };
        
        // Exclude the current user from search results
        query._id = { $ne: req.user.id };
        // Only search for regular users (donors)
        query.role = 'user';

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin gets all registered users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin resets user password
exports.adminResetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Storing as plain text for easy viewing
        await User.findByIdAndUpdate(id, { password: newPassword });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

