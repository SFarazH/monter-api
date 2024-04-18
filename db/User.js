const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

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
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = User = mongoose.model("User", userSchema);
