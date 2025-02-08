const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();



const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await User.findOne({ _id: decoded._id });
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
console.log(req.body)
    // Check if user exists
    const user = await User.findOne({ email });
    // console.log(user)
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "process.env.JWT_SECRET", {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

 // Ensure you have a User model


// Signup Route
router.post('/signup', async (req, res) => {
    try {
      console.log("signingup")
        const { firstName, lastName, email, password, profession, company, experience } = req.body;
        console.log(req.body)
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profession,
            company,
            experience
        });

        await newUser.save();

        // Generate JWT Token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;