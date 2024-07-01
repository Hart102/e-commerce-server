const express = require("express");
const router = express.Router();
const {
  CreateCategory,
  EditCategory,
  DeleteCategory,
  FetchAllCategory,
} = require("../../controllers/categories");
const authMiddleware = require("../../auth/authMiddleware");

router.post("/create", authMiddleware, CreateCategory);
router.post("/edit/:id", authMiddleware, EditCategory);
router.get("/fetch-all-categorie", FetchAllCategory);
router.delete("/delete/:id", authMiddleware, DeleteCategory);


module.exports = router;
