const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../db/UserModel");
const OTP = require("../db/otpModel");
const { sendOTPEmail } = require("../utils/email");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken")

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const user = new User({ email, password: hashedPassword });
    await user.save();

    const otpDocument = new OTP({
      userId: user._id,
      otp,
      createdAt: new Date(),
    });
    await otpDocument.save();

    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, location, age, work } = req.body;
    if (!otp) {
      res.status(500).json({ error: "Please enter OTP" });
    }
    if (!location || !age || !work) {
      res.status(500).json({ error: "Please enter additional user detailss" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpDocument = await OTP.findOne({ userId: user._id, otp });
    if (!otpDocument) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (otpDocument.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpDocument._id });

      const newOtp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      const newOtpDocument = new OTP({
        userId: user._id,
        otp: newOtp,
        createdAt: new Date(),
      });
      await newOtpDocument.save();

      await sendOTPEmail(email, newOtp);
      return res
        .status(400)
        .json({ error: "OTP expired, a new OTP has been sent to your email" });
    }
    if (user.is_verified) {
      return res.status(200).json({ message: "User already verified" });
    }

    user.is_verified = true;
    user.location = location;
    user.age = age;
    user.work = work;
    user.updatedAt = new Date();
    await user.save();

    await OTP.deleteOne({ _id: otpDocument._id });

    res.status(200).json({ message: "User verified and updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.json({ token });
  } catch (error) {
    // console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
