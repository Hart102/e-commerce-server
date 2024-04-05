const express = require("express");
const router = express.Router();
const { addProduct } = require("../controllers/products");
const { fileuploader } = require("../appWrite/index");

router.post("/add", fileuploader, addProduct);

module.exports = router;
