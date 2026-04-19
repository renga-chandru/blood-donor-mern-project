const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood-donor';

const updateAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        const result = await User.findOneAndUpdate(
            { email: 'admin@demo.com' },
            { password: 'admin123' },
            { new: true }
        );

        if (result) {
            console.log('Admin password successfully updated to plain-text "admin123"');
        } else {
            console.log('Admin user not found. Seeding new admin...');
            await new User({
                name: 'System Admin',
                email: 'admin@demo.com',
                password: 'admin123',
                phone: '1234567890',
                role: 'admin',
                bloodGroup: 'O+',
                city: 'Metropolis'
            }).save();
            console.log('Admin user seeded successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

updateAdmin();
