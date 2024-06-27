const express = require("express");
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  getCartItems,
} = require("../../controllers/Cart/index");
const authMiddleware = require("../../auth/authMiddleware");

router.use(authMiddleware);
router.put("/add-to-cart", addToCart); //Done
router.get("/get-cart-items", getCartItems); // Done
router.delete("/remove-cart-item/:id", removeFromCart); // Done

module.exports = router;
