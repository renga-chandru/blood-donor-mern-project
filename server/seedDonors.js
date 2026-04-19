const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Donor = require('./models/Donor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood-donor';

const cities = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 
    'Thoothukudi', 'Erode', 'Tiruppur', 'Vellore', 'Dindigul', 'Thanjavur', 
    'Karur', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Nagapattinam', 'Tiruvarur', 
    'Mayiladuthurai', 'Kumbakonam', 'Cuddalore', 'Villupuram', 'Kallakurichi', 
    'Kanchipuram', 'Chengalpattu', 'Tiruvallur', 'Ranipet', 'Tirupattur', 
    'Perambalur', 'Ariyalur', 'Pudukkottai', 'Sivagangai', 'Ramanathapuram', 
    'Virudhunagar', 'Theni', 'Tenkasi', 'Nagercoil', 'Kanyakumari', 'Ooty', 
    'Coonoor', 'Pollachi', 'Hosur', 'Gobichettipalayam', 'Sathyamangalam', 
    'Mettur', 'Palani', 'Oddanchatram', 'Sivakasi', 'Rajapalayam', 
    'Srivilliputhur', 'Paramakudi', 'Karaikudi', 'Rameswaram', 'Chidambaram', 
    'Panruti', 'Neyveli', 'Attur', 'Kodaikanal'
];

const maleNames = [
    'Senthil', 'Murugan', 'Karthick', 'Vignesh', 'Ramesh', 'Suresh', 'Kumar', 'Vijay', 
    'Surya', 'Arun', 'Karthik', 'Murali', 'Siva', 'Ganesan', 'Ramesh', 'Palanisamy',
    'Muthu', 'Perumal', 'Selvam', 'Balu', 'Dhanush', 'Jeeva', 'Kavin', 'Logesh'
];
const femaleNames = [
    'Priya', 'Anjali', 'Sneha', 'Lakshmi', 'Meena', 'Kavitha', 'Divya', 'Shanthi', 
    'Deepa', 'Rekha', 'Chitra', 'Vanitha', 'Geetha', 'Malar', 'Devi', 'Nandhini',
    'Pavithra', 'Shalini', 'Preethi', 'Gowri', 'Ambika', 'Parvathi', 'Valli', 'Radha'
];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Optional: Clear previous seeded data to avoid cluttering if you want a fresh start
        // await User.deleteMany({ email: { $regex: 'example.com' } });
        // await Donor.deleteMany({});

        for (const city of cities) {
            console.log(`Seeding data for ${city}...`);
            for (let i = 1; i <= 2; i++) {
                const isMale = Math.random() > 0.5;
                const firstName = isMale 
                    ? maleNames[Math.floor(Math.random() * maleNames.length)] 
                    : femaleNames[Math.floor(Math.random() * femaleNames.length)];
                
                const name = `${firstName} ${isMale ? 'K' : 'M'}`; // Adding an initial for realism
                const email = `${firstName.toLowerCase()}.${city.toLowerCase()}.${i}@tnmail.com`.replace(/\s/g, '');
                
                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) continue;

                const bloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
                const phone = `9${Math.floor(Math.random() * 900000000) + 100000000}`;

                const user = new User({
                    name,
                    email,
                    password: 'password123',
                    phone,
                    bloodGroup,
                    city,
                    role: 'user'
                });
                await user.save();

                const donor = new Donor({
                    userId: user._id,
                    name: user.name,
                    bloodGroup: user.bloodGroup,
                    phone: user.phone,
                    address: `Door No. ${10+i}, Main Road, ${city}`,
                    city: user.city,
                    status: 'approved',
                    availability: true,
                    isActive: true
                });
                await donor.save();
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
