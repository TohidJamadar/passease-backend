import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';


const UserRouter = express.Router();

const RegisterUser = async (req, res) => {
    const { fullname, email, password, route, profilepdf,profilepic } = req.body;

    if (!fullname || !email || !password || !route || !profilepdf) {
        return res.status(400).send('Please enter all required credentials');
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            route,
            profilepdf,
            profilepic
        });

        await newUser.save();
        res.status(201).send('User registered successfully');
        console.log(newUser)
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};



UserRouter.post('/register', RegisterUser);

export default UserRouter;
