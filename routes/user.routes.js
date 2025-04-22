const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User.model');

// Cloudinary config (Make sure to configure it properly)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UserRouter = express.Router();

// Multer setup to store temp files in 'uploads/' folder
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

        // Validate that the profile PDF exists
        if (!req.files.profilepdf) {
            return res.status(400).json({ error: 'Profile PDf is required' });
        }

        // Validate that the profile photo exists
        if (!req.files.profilepic) {
            return res.status(400).json({ error: 'Profile photo is required' });
        }

        try {
            // Check if the profile PDF is a valid PDF file
            const pdfFile = req.files.profilepdf[0];
            if (pdfFile.mimetype !== 'application/pdf') {
                return res.status(400).json({ error: 'Invalid file format for profile PDF. Only PDFs are allowed.' });
            }

            // Upload PDF to Cloudinary
            const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
                resource_type: 'raw',
                folder: 'uploads/pdf',
                public_id: pdfFile.originalname.replace(/\.[^/.]+$/, ""),
                format: 'pdf'
              });
              
            fs.unlinkSync(pdfFile.path); // Remove temp PDF file

            // Check if the profile photo is a valid image file
            const imageFile = req.files.profilepic[0];
            if (!imageFile.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Invalid file format for profile photo. Only image files are allowed.' });
            }

            // Upload profile pic to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'uploads/images', // Folder for images
            });
            const profilepicURL = imageUpload.secure_url;
            fs.unlinkSync(imageFile.path); // Remove temp image file

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Save user in the database
            const newUser = new User({
                fullname,
                email,
                password: hashedPassword,
                route,
                profilepdf: pdfUpload.secure_url,
                profilepic: profilepicURL,
            });

            await newUser.save();
            res.status(201).json({
                message: 'User registered successfully',
                user: newUser,
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error during registration or file upload' });
        }
    }
);

UserRouter.post('/login', async (req, res) => {
    const { fullname, password } = req.body;

    if (!fullname || !password) {
        return res.status(400).json({ error: 'Please enter both fullname and password' });
    }

    try {
        const user = await User.findOne({ fullname });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

UserRouter.get('/getall', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error while fetching users' });
    }
});


// Add this below your /getall route

UserRouter.post('/scan', async (req, res) => {
    const { fullname } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: 'Fullname is required' });
    }

    try {
        const user = await User.findOne({ fullname });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if(user.scanCount > 0) {
            user.scanCount -= 1;
            user.lastScanDate = new Date(); // update last scan date to today
            await user.save();

            res.status(200).json({
                message: 'Scan successful',
                remainingScans: user.scanCount
            });
            return;
        }

        if (user.scanCount <= 0) {
            return res.status(403).json({ error: 'Scan limit reached for today' });
        }

    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: 'Server error during scan check' });
    }
});

UserRouter.post('/daysleft', async (req, res) => {
    const { fullname } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: 'Fullname is required' });
    }

    try {
        const user = await User.findOne({ fullname });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        const lastScanDate = new Date(user.lastScanDate).toISOString().split('T')[0];

        if (today !== lastScanDate) {
            user.scanCount = 2;
            user.lastScanDate = new Date();
            user.daysLeft -= 1;
            await user.save();
        }

        return res.status(200).json({ daysLeft: user.daysLeft });
    } catch (err) {
        console.error('Error fetching daysLeft:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});


UserRouter.post('/status', async (req, res) => {
    const { fullname, paid } = req.body; // Including paid status in the request body

    if (!fullname) {
        return res.status(400).json({ error: 'Fullname is required' });
    }

    try {
        const user = await User.findOne({ fullname });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If the paid status is provided in the request, update it
        if (user.paid === false) {
            user.paid = true; // Update the paid status to the new value
        }

        await user.save();

        return res.status(200).json({
            paidStatus: user.paid,
            daysLeft: user.daysLeft,
            scanCount: user.scanCount,
        });
    } catch (error) {
        console.error('Error fetching or updating user status:', error);
        return res.status(500).json({ error: 'Server error during status fetch or update' });
    }
});





module.exports = UserRouter;