const express = require("express");
const router = express.Router();
const {
  register,
  login,
  addAddress,
  FetchUserAddress,
  DeleteAddress,
  EditProfile,
  ResetPassword,
} = require("../../controllers/User/index");
const authMiddleWare = require("../../auth/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/add-address", authMiddleWare, addAddress);
router.get("/get-address", authMiddleWare, FetchUserAddress);
router.patch("/edit-profile", authMiddleWare, EditProfile);
router.patch("/reset-password", authMiddleWare, ResetPassword);
router.delete("/delete-address/:id", authMiddleWare, DeleteAddress);




module.exports = router;
