const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { message, rating, name } = req.body;
        const feedback = new Feedback({
            userId: req.user.id,
            name: name || 'Anonymous',
            message,
            rating
        });
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
