const express = require("express");
const router = express.Router();
const {
  UserRegisteration,
  UserLogin,
  CreateAddress,
  FetchUserAndUserAddress,
  DeleteAddress,
  EditProfile,
  ResetPassword,
  LogOut,
} = require("../../controllers/User/index");
const authMiddleWare = require("../../auth/authMiddleware");

router.post("/register", UserRegisteration);
router.post("/login", UserLogin);
router.post("/logout", LogOut);
router.patch("/edit-profile", authMiddleWare, EditProfile);
router.patch("/reset-password", authMiddleWare, ResetPassword);

router.post("/add-address", authMiddleWare, CreateAddress);
router.get(
  "/get-user-and-user-address",
  authMiddleWare,
  FetchUserAndUserAddress
);
router.delete("/delete-address/:id", authMiddleWare, DeleteAddress);





module.exports = router;
