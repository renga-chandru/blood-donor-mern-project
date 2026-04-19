const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: { type: String, required: true },
    location: { type: String, required: true },
    contact: { type: String, required: true },
    urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
