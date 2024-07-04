const express = require("express");
const router = express.Router();
const {
  register,
  login,
  CreateAddress,
  FetchUserAndUserAddress,
  DeleteAddress,
  EditProfile,
  ResetPassword,
} = require("../../controllers/User/index");
const authMiddleWare = require("../../auth/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/add-address", authMiddleWare, CreateAddress);
router.get(
  "/get-user-and-user-address",
  authMiddleWare,
  FetchUserAndUserAddress
);
router.patch("/edit-profile", authMiddleWare, EditProfile);
router.patch("/reset-password", authMiddleWare, ResetPassword);
router.delete("/delete-address/:id", authMiddleWare, DeleteAddress);




module.exports = router;
