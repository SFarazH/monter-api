const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  location: {
    type: String,
  },
  age: {
    type: Number,
  },
  work_details: {
    type: String,
  },
});

module.exports = User = mongoose.model("User", userSchema);
