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
} = require("../controllers/products");

router.post("/addproduct/:id", fileuploader, addProduct);
router.get("/", getAllProducts);
router.get("/:id", fileuploader, getProductById);
router.get("/category/:category", fileuploader, getByCategory);
router.delete("/delete/:id", deleteProduct);
router.post("/cart", addToCart);
router.post("/cart/:userId", getCartItems);






module.exports = router;
