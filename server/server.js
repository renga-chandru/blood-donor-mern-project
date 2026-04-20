require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const donorRoutes = require('./routes/donorRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // You can restrict this to the frontend URL in production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Pass io to request globally or set app locally
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected via Socket.io:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/user', userRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/blood-bank', bloodBankRoutes);

// Serving Frontend in Production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('MongoDB connected successfully');
    
    // Auto-seed admin user
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
        if (!existingAdmin) {
            await new User({
                name: 'System Admin',
                email: 'admin@demo.com',
                password: 'admin123',
                phone: '1234567890',
                role: 'admin',
                bloodGroup: 'O+',
                city: 'Metropolis'
            }).save();
            console.log('Admin user seeded automatically!');
        }
    } catch (err) {
        console.error('Failed to seed admin:', err);
    }

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});
