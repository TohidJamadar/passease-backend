const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI).then(() => {
            console.log('MongoDB connected...');
        });
    }
    catch (err) {
        console.error(err.message);
    }
}

module.exports = connectDB;