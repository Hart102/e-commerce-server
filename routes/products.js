const express = require("express");
const router = express.Router();
const { fileuploader } = require("../appWrite/index");
const {
  addProduct,
  getAllProducts,
  getProductById,
  getByCategory,
  deleteProduct,
  addToCart,
  getCartItems,
  removeFromCart,
} = require("../controllers/products");

router.get("/", getAllProducts);
router.post("/addproduct", fileuploader, addProduct);
router.get("/getProductById/:id", getProductById);
router.get("/category/:category", getByCategory);
router.delete("/delete/:id", deleteProduct);
router.post("/cart", addToCart);
router.get("/cart/getCartItems", getCartItems);
router.post("/cart/removeItem/:id", removeFromCart);

module.exports = router;
