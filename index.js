const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbConnect = require("./db/dbConnect");
var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const userRoutes = require("./routes/user");

app.use(express.json());
dbConnect();

const PORT = process.env.PORT || 3003;

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
