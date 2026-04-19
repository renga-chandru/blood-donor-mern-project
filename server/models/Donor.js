const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    availability: { type: Boolean, default: true },
    lastDonatedDate: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rating: { type: Number, default: 0 },
    donationsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
