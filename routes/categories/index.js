const express = require("express");
const router = express.Router();
const { CreateCategory } = require("../../controllers/categories");

router.put("/create", CreateCategory);

module.exports = router;
