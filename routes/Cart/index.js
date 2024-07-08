const express = require("express");
const router = express.Router();
const {
  AddToCart,
  RemoveFromCart,
  FetchCartItems,
} = require("../../controllers/Cart/index");
const authMiddleware = require("../../auth/authMiddleware");

router.use(authMiddleware);
router.put("/add-to-cart", AddToCart); //Done
router.get("/get-cart-items", FetchCartItems); // Done
router.delete("/remove-cart-item/:id", RemoveFromCart); // Done

module.exports = router;
