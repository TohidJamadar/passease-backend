const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User.model');

const AdminRouter = express.Router();

const VerifiedBydmin = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isVerfied = true;
        await user.save();
        res.status(200).json({ message: 'User verified successfully', user });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
}

AdminRouter.post('/verify', VerifiedBydmin);



module.exports = AdminRouter;