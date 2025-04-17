const bcrypt = require('bcrypt');
const User = require('../models/User.model');

const RegisterUser = async (req, res) => {
    const { fullname, email, password, route } = req.body;
    const profilepic = req.files?.profilepic?.[0];
    const profilepdf = req.files?.profilepdf?.[0];

    if (!fullname || !email || !password || !route || !profilepic || !profilepdf) {
        return res.status(400).json({ message: 'Please enter all required credentials' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            route,
            profilepic: profilepic.filename,
            profilepdf: profilepdf.filename
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
        console.log('Registered User:', newUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all required credentials' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user._doc;

        res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    RegisterUser,
    LoginUser
};
