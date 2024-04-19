const jwt = require("jsonwebtoken");
const User = require("../db/UserModel");

// function to authenticate user based on JWT Token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    // decoding token and matching userId to documents in DB
    const user = await User.findById(decodedToken.userId);

    // check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // return user details
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authenticate };
