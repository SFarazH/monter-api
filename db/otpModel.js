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
    expiration: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 300 * 1000);  // 5 mins 
      },
    },
  });

module.exports = mongoose.model("OTP", otpSchema);
