const express = require("express");
const router = express.Router();
const {
  register,
  login,
  addLocation,
  getUserAddress,
} = require("../../controllers/User/index");

router.post("/register", register);
router.post("/login", login);
router.post("/add-address", addLocation);
router.get("/get-address", getUserAddress);

module.exports = router;