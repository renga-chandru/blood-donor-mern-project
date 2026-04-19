const Transaction = require('../models/Transaction');

// Get transaction history for current user
exports.getUserHistory = async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.user.id })
            .populate('requestId')
            .sort({ date: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin gets all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const history = await Transaction.find()
            .populate('userId', 'name email')
            .populate('requestId')
            .sort({ date: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
