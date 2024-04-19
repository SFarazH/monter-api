const bcrypt = require("bcryptjs");
const User = require("../db/UserModel");
const OTP = require("../db/otpModel");
const { sendOTPEmail } = require("../utils/email");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if request body sent
    if (!password || !email) {
      return res.status(400).json({ error: "Please enter email and password" });
    }

    // check if user exists
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

    // save user
    await user.save();

    const otpDocument = new OTP({
      userId: user._id,
      otp,
      createdAt: new Date(),
    });
    // save OTP document containing OTP and userId of the created user.
    await otpDocument.save();

    // send email to user with OTP
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message:
        "User registered successfully. Please verify using OTP sent on mail",
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // check OTP in request body
    if (!otp || !email) {
      return res.status(400).json({ error: "Please enter OTP and email" });
    }

    const user = await User.findOne({ email });

    // check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const otpDocument = await OTP.findOne({ userId: user._id, otp });

    // check if OTP exists
    if (!otpDocument) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // check if OTP has timed out (5 minutes)
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
      // if OTP has timed out, create and save new OTP and send new email
      await newOtpDocument.save();
      await sendOTPEmail(email, newOtp);
      return res
        .status(400)
        .json({ error: "OTP expired, a new OTP has been sent to your email" });
    }

    if (user.is_verified) {
      return res.status(200).json({ message: "User already verified." });
    }

    // update is_verified status of the user
    user.is_verified = true;
    user.updatedAt = new Date();
    await user.save();

    // delete the OTP document of current user after verification
    await OTP.deleteOne({ _id: otpDocument._id });

    // generate JWT Token AFTER succcessful verification (for updating data)
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });

    res.status(200).json({ token: token, message: "User has been verified!" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { location, age, work } = req.body;

  try {
    // check if all required fields sent in request body
    if (!location || !age || !work) {
      return res.status(500).json({ error: "Please enter all the details" });
    }
    const user = req.user;

    // check if user is verified or not
    if (!user.is_verified) {
      return res.status(400).json({ error: "User is not verified" });
    }

    // update the details of the user
    user.location = location;
    user.age = age;
    user.work = work;
    user.updatedAt = new Date();

    await user.save();
    res.status(200).json({ message: "User data updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if email and password sent in request body
    if (!email || !password) {
      return res
        .status(500)
        .json({ error: "Please enter email and password to login" });
    }

    const user = await User.findOne({ email });

    // check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if user is verified
    if (!user.is_verified) {
      return res.status(401).json({ message: "User is not verified" });
    }

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // generate JWT Token after successful login
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getData = async (req, res) => {
  try {
    const user = req.user;

    // check if user is verified
    if (!user.is_verified) {
      return res.status(400).json({ error: "User is not verified" });
    }

    const { email, location, age, work } = user;

    // return the data of the user
    const userData = { email: email, location: location, age: age, work: work };
    res.status(200).json({ data: userData });
  } catch (error) {
    res.status(500).json({ message: `Error getting data : ${error}` });
  }
};

module.exports = { register, verify, update, login, getData };
