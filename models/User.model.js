const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    route: { type: String },
    profilepdf: { type: String },
    profilepic: { type: String },
    
    // NEW FIELDS
    scanCount: {
        type: Number,
        default: 2 // starts with 2 scans allowed per day
    },
    lastScanDate: {
        type: Date,
        default: new Date() // sets it to today when user is created
    }
});

module.exports = mongoose.model('User', userSchema);
