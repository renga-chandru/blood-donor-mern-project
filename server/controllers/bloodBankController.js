const BloodBank = require('../models/BloodBank');

exports.addBloodBank = async (req, res) => {
    try {
        const bloodBank = new BloodBank(req.body);
        await bloodBank.save();
        res.status(201).json({ message: 'Blood Bank added successfully', bloodBank });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBloodBanks = async (req, res) => {
    try {
        const { city } = req.query;
        let query = { isActive: true };
        if (city) query.city = new RegExp(city, 'i');
        
        const banks = await BloodBank.find(query).sort({ name: 1 });
        res.status(200).json(banks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateBloodBank = async (req, res) => {
    try {
        const bank = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bank) return res.status(404).json({ message: 'Blood bank not found' });
        res.status(200).json({ message: 'Blood bank updated', bank });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteBloodBank = async (req, res) => {
    try {
        const bank = await BloodBank.findByIdAndDelete(req.params.id);
        if (!bank) return res.status(404).json({ message: 'Blood bank not found' });
        res.status(200).json({ message: 'Blood bank deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
