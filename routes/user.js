const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  register,
  verify,
  update,
  login,
  getData,
} = require("../controller/user");

router.post("/register", register);

router.post("/verify", verify);

router.post("/update", authenticate, update);

router.post("/login", login);

router.get("/data", authenticate, getData);

module.exports = router;
