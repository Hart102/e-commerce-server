const express = require("express");
const router = express.Router();
const { fileuploader } = require("../../config/appWrite/index");
const {
  createProduct,
  getProductsByUserId,
  getProductById,
  getByCategory,
  deleteProduct,
} = require("../../controllers/Product/index");

router.get("/", getProductsByUserId); //Done
router.put("/create_product", fileuploader, createProduct); //Done
router.delete("/delete/:id", deleteProduct); //Done
router.get("/getProductById/:id", getProductById);
router.get("/category/:category", getByCategory);

module.exports = router;
