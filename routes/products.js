const express = require("express");
const router = express.Router();
const { fileuploader } = require("../appWrite/index");
const {
  addProduct,
  getAllProducts,
  getProductById,
  getByCategory,
  deleteProduct,
} = require("../controllers/products");

router.post("/addproduct/:id", fileuploader, addProduct);
router.get("/", getAllProducts);
router.get("/:id", fileuploader, getProductById);
router.get("/category/:category", fileuploader, getByCategory);
router.delete("/delete/:id", deleteProduct);




module.exports = router;
