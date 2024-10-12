// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/tourguide', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isGuide: { type: Boolean, default: false },
    guideDetails: {
        bio: String,
        location: String,
        experience: Number,
        languages: [String]
    }
});

const User = mongoose.model('User', userSchema);

// Register as a guide
app.post('/register', async (req, res) => {
    const { name, email, password, isGuide, bio, location, experience, languages } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        isGuide,
        guideDetails: isGuide ? { bio, location, experience, languages } : {}
    });

    try {
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(400).send('Error registering user');
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(400).send('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: user._id }, 'secretkey');
    res.json({ token, user });
});

// Fetch all guides
app.get('/guides', async (req, res) => {
    const guides = await User.find({ isGuide: true });
    res.json(guides);
});

// Start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
