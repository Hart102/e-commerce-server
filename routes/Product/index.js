const express = require("express");
const router = express.Router();
const { fileuploader } = require("../../config/appWrite/index");
const {
  CreateProduct,
  DeleteProduct,
  EditProduct,
  GetAllProducts,
  // GetProductById,
  GetProductsByCategory,
} = require("../../controllers/Product/index");
const authMiddleware = require("../../auth/authMiddleware");

router.get("/", GetAllProducts);
router.put("/create", authMiddleware, fileuploader, CreateProduct); //Done
router.put("/edit", authMiddleware, fileuploader, EditProduct); //Done
router.delete("/delete/:id", authMiddleware, DeleteProduct); //Done
// router.get("/getProductById/:id", GetProductById);
router.get("/category/:category", GetProductsByCategory);

module.exports = router;
