const bcrypt = require("bcrypt");
const User = require("../db/UserModel");
const OTP = require("../db/otpModel");
const { sendOTPEmail } = require("../utils/email");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
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
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!otp) {
      res.status(500).json({ error: "Please enter OTP" });
    }
    // if (!location || !age || !work) {
    //   res.status(500).json({ error: "Please enter additional user detailss" });
    // }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    const otpDocument = await OTP.findOne({ userId: user._id, otp });

    if (!otpDocument) {
      res.status(400).json({ error: "Invalid OTP" });
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
      res
        .status(400)
        .json({ error: "OTP expired, a new OTP has been sent to your email" });
    }

    if (user.is_verified) {
      res.status(200).json({ message: "User already verified." });
    }

    user.is_verified = true;
    // user.location = location;
    // user.age = age;
    // user.work = work;
    user.updatedAt = new Date();
    await user.save();

    await OTP.deleteOne({ _id: otpDocument._id });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.status(200).json({ token: token, message: "User has been verified!" });

    // res.status(200).json({ message: "User verified and updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { location, age, work } = req.body;
  try {
    const user = req.user;
    if (!user.is_verified) {
      res.status(400).json({ error: "User is not verified" });
    }
    user.location = location;
    user.age = age;
    user.work = work;
    user.updatedAt = new Date();

    await user.save();
    res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    if (!user.is_verified) {
      res.status(401).json({ message: "User is not verified" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getData = async (req, res) => {
  try {
    const user = req.user;
    if (!user.is_verified) {
      res.status(400).json({ error: "User is not verified" });
    }
    const { email, location, age, work } = user;
    const userData = { email: email, location: location, age: age, work: work };
    res.status(200).json({ data: userData });
  } catch (error) {
    res.status(500).json({ message: `Error getting data : ${error}` });
  }
};

module.exports = { register, verify, update, login, getData };
