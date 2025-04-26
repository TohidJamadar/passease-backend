const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User.model');

const AdminRouter = express.Router();

const VerifiedByAdmin = async (req, res) => {
    const { fullname } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: 'Fullname is required' });
    }

    try {
        const user = await User.findOne({ fullname });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
                                                           
        user.isVerified = true;                                                          
        await user.save();

        res.status(200).json({ message: 'User verified successfully', user });
    } catch (error) {                   
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};



AdminRouter.post('/verify', VerifiedByAdmin);



module.exports = AdminRouter;