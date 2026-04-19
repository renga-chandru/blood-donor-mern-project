const mongoose = require('mongoose');
require('dotenv').config();
const BloodBank = require('./models/BloodBank');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood-donor';

const initialBanks = [
    {
        name: 'Government General Hospital Blood Bank',
        city: 'Chennai',
        address: 'Park Town, Chennai, Tamil Nadu 600003',
        phone: '044-25305000',
        stock: { 'A+': 15, 'A-': 5, 'B+': 22, 'B-': 3, 'AB+': 8, 'AB-': 2, 'O+': 35, 'O-': 10 }
    },
    {
        name: 'Apollo Hospital Blood Bank',
        city: 'Chennai',
        address: 'Greams Road, Chennai, Tamil Nadu 600006',
        phone: '044-28293333',
        stock: { 'A+': 30, 'A-': 12, 'B+': 45, 'B-': 8, 'AB+': 20, 'AB-': 5, 'O+': 60, 'O-': 15 }
    },
    {
        name: 'Tirunelveli Medical College Hospital',
        city: 'Tirunelveli',
        address: 'High Ground, Tirunelveli, Tamil Nadu 627011',
        phone: '0462-2572733',
        stock: { 'A+': 20, 'A-': 4, 'B+': 18, 'B-': 2, 'AB+': 10, 'AB-': 1, 'O+': 40, 'O-': 8 }
    },
    {
        name: 'Madurai Rajaji Government Hospital',
        city: 'Madurai',
        address: 'Panagal Road, Madurai, Tamil Nadu 625020',
        phone: '0452-2532535',
        stock: { 'A+': 25, 'A-': 7, 'B+': 30, 'B-': 5, 'AB+': 12, 'AB-': 3, 'O+': 50, 'O-': 12 }
    },
    {
        name: 'Coimbatore Medical College Hospital',
        city: 'Coimbatore',
        address: 'Trichy Road, Coimbatore, Tamil Nadu 641018',
        phone: '0422-2301393',
        stock: { 'A+': 22, 'A-': 6, 'B+': 28, 'B-': 4, 'AB+': 15, 'AB-': 2, 'O+': 45, 'O-': 10 }
    }
];

const seedBanks = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for bank seeding...');

        await BloodBank.deleteMany({});
        await BloodBank.insertMany(initialBanks);

        console.log('Blood Banks seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedBanks();
