const express = require("express");
const router = express.Router();
const {
  CreateCategory,
  DeleteCategory,
  FetchAllCategory,
} = require("../../controllers/categories");
const authMiddleware = require("../../auth/authMiddleware");

router.use(authMiddleware);
router.put("/create", CreateCategory);
router.get("/fetch-all-categorie", FetchAllCategory);
router.delete("/delete/:id", DeleteCategory);


module.exports = router;
