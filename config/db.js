require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI; // MongoDB URI from the .env file
        if (!dbURI) {
            throw new Error('MongoDB URI is missing in the environment variables');
        }

        // Using await for the connection without urlParser and unifiedTopology options
        await mongoose.connect(dbURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
};

module.exports = connectDB;
