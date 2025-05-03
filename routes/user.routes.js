const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User.model');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UserRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /register
UserRouter.post(
    '/register',
    upload.fields([
        { name: 'profilepic', maxCount: 1 },
        { name: 'profilepdf', maxCount: 1 },
    ]),
    async (req, res) => {
        const { fullname, email, password, route } = req.body;

        if (!fullname || !email || !password || !route) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        if (!req.files.profilepdf || !req.files.profilepic) {
            return res.status(400).json({ error: 'Profile photo and PDF are required' });
        }

        try {
            const pdfFile = req.files.profilepdf[0];
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json({ error: 'Only PDF files are allowed' });
            }

            const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
                resource_type: 'raw',
                folder: 'uploads/pdf',
                public_id: pdfFile.originalname.replace(/\.[^/.]+$/, ""),
                format: 'pdf'
            });
            fs.unlinkSync(pdfFile.path);

            const imageFile = req.files.profilepic[0];
            if (!imageFile.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Only image files are allowed' });
            }

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'uploads/images',
            });
            const profilepicURL = imageUpload.secure_url;
            fs.unlinkSync(imageFile.path);

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                fullname,
                email,
                password: hashedPassword,
                route,
                profilepdf: pdfUpload.secure_url,
                profilepic: profilepicURL,
            });

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
);

// POST /login
UserRouter.post('/login', async (req, res) => {
    const { fullname, password } = req.body;

    if (!fullname || !password) {
        return res.status(400).json({ error: 'Please enter both fullname and password' });
    }

    try {
        const user = await User.findOne({ fullname });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /getall
UserRouter.get('/getall', async (req, res) => {
    try {
        const users = await User.find({ isVerified: false });  // Add condition to filter verified users
        res.status(200).json(users);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Server error while fetching users' });
    }
});

// POST /scan
UserRouter.post('/scan', async (req, res) => {
    const { fullname } = req.body;
    if (!fullname) return res.status(400).json({ error: 'Fullname is required' });

    try {
        const user = await User.findOne({ fullname });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.scanCount > 0) {
            user.scanCount -= 1;
            await user.save();
            return res.status(200).json({ message: 'Scan successful', scanCount: user.scanCount });
        } else {
            return res.status(403).end(); // No custom message
        }
    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: 'Server error during scan' });
    }
});


// POST /daysleft
UserRouter.post('/daysleft', async (req, res) => {
    const { fullname } = req.body;
    if (!fullname) return res.status(400).json({ error: 'Fullname is required' });

    try {
        const user = await User.findOne({ fullname });
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ daysLeft: user.daysLeft });
    } catch (error) {
        console.error('Days left error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /status
UserRouter.post('/status', async (req, res) => {
    const { fullname } = req.body;
    if (!fullname) return res.status(400).json({ error: 'Fullname is required' });

    try {
        const user = await User.findOne({ fullname });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({
            paid: user.paid,
            daysLeft: user.daysLeft,
            scanCount: user.scanCount,
            route: user.route,
            isVerified: user.isVerified,
            msg: user.rejectMessage,
            Id: user._id,
        });
         
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Server error during status check' });
    }
});


// POST /paid
UserRouter.post('/paid', async (req, res) => {
    const { fullname } = req.body;
    if (!fullname) return res.status(400).json({ error: 'Fullname is required' });

    try {
        const user = await User.findOne({ fullname });                          
        if (!user) return res.status(404).json({ error: 'User not found' });                                         

        user.paid = true;                                                                                                                                                   
        await user.save();

        res.status(200).json({ message: 'User payment status updated to paid', user });
    } catch (error) {
        console.error('Payment status update error:', error);
        res.status(500).json({ error: 'Server error during payment update' });
    }
});


// DELETE /delete/:id
// DELETE /delete/:id
UserRouter.post('/delete', async (req, res) => {
    const { fullname } = req.body;

    try {
        const user = await User.findOneAndDelete({ fullname });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error while deleting user' });
    }
});



module.exports = UserRouter;
