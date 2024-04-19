const express = require("express");
const app = express();
const dbConnect = require("./db/dbConnect");
const userRoutes = require("./routes/user");
const serverless = require("serverless-http")

app.use(express.json());

// allow cross origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

dbConnect();
const PORT = process.env.PORT || 3003;

app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports.handler = serverless(app);