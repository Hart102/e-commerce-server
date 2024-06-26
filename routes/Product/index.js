const express = require("express");
const router = express.Router();
const { fileuploader } = require("../../config/appWrite/index");
const {
  CreateProduct,
  DeleteProduct,
  EditProduct,
  GetProductsByUserId,
  GetProductById,
  GetByCategory,
} = require("../../controllers/Product/index");
const authMiddleware = require("../../auth/authMiddleware");

router.put("/create", authMiddleware, fileuploader, CreateProduct); //Done
router.put("/edit", authMiddleware, fileuploader, EditProduct); //Done
router.delete("/delete/:id", authMiddleware, DeleteProduct); //Done
router.get("/", authMiddleware, GetProductsByUserId); //Done
router.get("/getProductById/:id", GetProductById);
router.get("/category/:category", GetByCategory);

module.exports = router;
