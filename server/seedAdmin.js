const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@demo.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      existingAdmin.password = await bcrypt.hash('admin123', 10);
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '1234567890',
        role: 'admin',
        bloodGroup: 'O+',
        city: 'Metropolis'
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
