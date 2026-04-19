const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: { type: String, required: true },
    requestType: { type: String, enum: ['Donate', 'Receive'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
    urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    quantity: { type: Number, default: 1 }, 
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // for directed P2P
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
