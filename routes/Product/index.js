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

router.put("/create", fileuploader, CreateProduct); //Done
router.put("/edit", fileuploader, EditProduct); //Done
router.delete("/delete/:id", DeleteProduct); //Done
router.get("/", GetProductsByUserId); //Done
router.get("/getProductById/:id", GetProductById);
router.get("/category/:category", GetByCategory);

module.exports = router;
