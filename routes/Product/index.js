const express = require("express");
const router = express.Router();
const { fileuploader } = require("../../config/appWrite/index");
const authMiddleware = require("../../auth/authMiddleware");
const {
  CreateProduct,
  DeleteProduct,
  EditProduct,
  GetAllProducts,
  GetProductById,
  GetProductsByCategory,
} = require("../../controllers/Product/index");

router.get("/", GetAllProducts);
router.get("/:id", GetProductById);

router.put("/create", authMiddleware, fileuploader, CreateProduct);
router.put("/edit", authMiddleware, fileuploader, EditProduct);
router.delete("/delete/:id", authMiddleware, DeleteProduct);
router.get("/category/:category", GetProductsByCategory);

module.exports = router;
