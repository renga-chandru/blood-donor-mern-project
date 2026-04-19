# LifeDrops - Blood Donor Finder & Emergency Management

LifeDrops is a production-ready MERN (MongoDB, Express, React, Node) stack application designed to save lives by connecting blood donors with those in urgent need.

## Features

- **Secure Authentication**: JWT-based login with bcrypt password hashing.
- **Donor Management**: Users can register as donors; profiles are hidden until approved by an admin.
- **Smart Search**: Filter donors by blood group, city, and real-world eligibility (3-month gap check).
- **Emergency Broadcast**: Socket.io real-time notifications for urgent blood requests.
- **User Dashboard**: Track donation history, update availability, and manage requests.
- **Admin Panel**: Statistics, donor approval workflow, and system monitoring.
- **Premium UI**: Modern design with Tailwind CSS, Hero sections, glassmorphism, and DARK MODE.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Real-time**: Socket.io.
- **Notifications**: React Hot Toast.

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RENGA
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/blood-donor-db
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Client Setup**
   ```bash
   cd ../client
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## Demo Credentials

- **Admin**: `admin@demo.com` / `admin123`
- **User**: `user@demo.com` / `password123`

---
*Every drop counts. Save a life today.*
