const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dbConnect = require("./db/dbConnect");
var nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

app.use(express.json());
dbConnect();

app.listen(3001, () => {
  console.log(`Server running`);
});
