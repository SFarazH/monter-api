const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 60 * 1000); 
      },
    },
  });

module.exports = mongoose.model("OTP", otpSchema);
