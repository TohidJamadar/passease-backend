const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
         type: String, 
         required: true
    },
    email: { 
        type: String, 
        required: true, unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    route: { 
        type: String 
    },
    profilepdf: { 
        type: String 
    },
    profilepic: { 
        type: String 
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    scanCount: {
        type: Number,
        default: 2
    },
    lastScanDate: {
        type: Date,
        default: new Date() // sets it to today when user is created
    },
    daysLeft: {
        type: Number,
        default: 30// starts with 2 scans allowed per day
    },
    paid:{
        type: Boolean,
        default: false
    },
    rejectMessage: {
        type: String,
        default: ''
    },
});

module.exports = mongoose.model('User', userSchema);