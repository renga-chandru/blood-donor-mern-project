const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const dummyUsers = [
  { name: 'John Doe', email: 'john@example.com', password: 'password123', phone: '9876543210', bloodGroup: 'A+', city: 'New York' },
  { name: 'Alice Smith', email: 'alice@example.com', password: 'password123', phone: '9876543211', bloodGroup: 'B+', city: 'London' },
  { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123', phone: '9876543212', bloodGroup: 'O-', city: 'New York' },
  { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', phone: '9876543213', bloodGroup: 'AB+', city: 'Chennai' },
  { name: 'David Wilson', email: 'david@example.com', password: 'password123', phone: '9876543214', bloodGroup: 'A-', city: 'London' },
  { name: 'Eva Green', email: 'eva@example.com', password: 'password123', phone: '9876543215', bloodGroup: 'O+', city: 'Chennai' },
  { name: 'Frank Miller', email: 'frank@example.com', password: 'password123', phone: '9876543216', bloodGroup: 'B-', city: 'New York' },
  { name: 'Grace Hopper', email: 'grace@example.com', password: 'password123', phone: '9876543217', bloodGroup: 'AB-', city: 'London' },
  { name: 'Hank Hill', email: 'hank@example.com', password: 'password123', phone: '9876543218', bloodGroup: 'A+', city: 'Chennai' },
  { name: 'Ivy League', email: 'ivy@example.com', password: 'password123', phone: '9876543219', bloodGroup: 'O+', city: 'New York' },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Filter out users that already exist
    for (const u of dummyUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await new User({ ...u, password: hashedPassword }).save();
        console.log(`Created user: ${u.name}`);
      }
    }

    console.log('Dummy users seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
