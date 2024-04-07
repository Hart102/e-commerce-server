const express = require("express");
const router = express.Router();
const { fileuploader } = require("../appWrite/index");
const { addProduct, getProductById } = require("../controllers/products");

router.post("/add", fileuploader, addProduct);
router.get("/:id", fileuploader, getProductById);


module.exports = router;
