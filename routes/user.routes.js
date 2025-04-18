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

        if (!req.files || !req.files.profilepdf) {
            return res.status(400).json({ error: 'Profile PDF is required' });
        }

        try {
            // Upload PDF to Cloudinary
            const pdfFile = req.files.profilepdf[0];
            const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
                resource_type: 'raw',
                folder: 'uploads/docs',
            });
            fs.unlinkSync(pdfFile.path); // remove temp file

            // Upload profile pic (optional)
            let profilepicURL = '';
            if (req.files.profilepic && req.files.profilepic[0]) {
                const imageFile = req.files.profilepic[0];
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    folder: 'uploads/images',
                });
                profilepicURL = imageUpload.secure_url;
                fs.unlinkSync(imageFile.path); // remove temp image
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Save user
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
        // Find user by fullname instead of email
        const user = await User.findOne({ fullname });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Successful login
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

module.exports = UserRouter;