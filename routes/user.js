const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');
const otpGenerator = require('otp-generator')


router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    // const otp = Math.floor(100000 + Math.random() * 900000);
    const user = new User({ email, password: hashedPassword, otp });
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});