const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_ID,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendOTPEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.USER_ID,
      to: email,
      subject: "OTP for Account Verification",
      html: `<p>OTP to verify your account is ${otp}</p>`,
    });
  } catch (error) {
    // console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

module.exports = { sendOTPEmail };
