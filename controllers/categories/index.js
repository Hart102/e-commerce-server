require("dotenv").config();
const connection = require("../../config/DbConnect");
const { categorySchema } = require("../../schema/index");

const CreateCategory = (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    connection.query(
      "INSERT INTO categories SET?",
      { name: value.name.toLowerCase(), status: value.status },
      (error, result) => {
        if (error) {
          return res.json({
            isError: true,
            message: "Something went wrong. Please try again.",
          });
        }
        if (result.affectedRows > 0) {
          res.json({
            isError: false,
            message: "Category created successfully!",
          });
        }
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

const EditCategory = (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    connection.query(
      "UPDATE categories SET? WHERE id =?",
      [{ name: value.name.toLowerCase(), status: value.status }, req.params.id],
      (error, result) => {
        if (error) {
          return res.json({
            isError: true,
            message: "Something went wrong. Please try again.",
          });
        }
        if (result.affectedRows > 0) {
          res.json({
            isError: false,
            message: "Category updated successfully!",
          });
        }
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

const FetchAllCategory = (req, res) => {
  try {
    const sql = `SELECT 
        categories.*, 
        COUNT(products.id) AS product_count
      FROM 
        categories
      LEFT JOIN 
        products ON categories.name = products.category
      GROUP BY 
        categories.id
      ORDER BY 
        categories.createdAt DESC`;
    connection.query(sql, (error, result) => {
      if (error) {
        return res.json({
          isError: true,
          message: "Something went wrong. Please try again.",
        });
      }
      res.json({ isError: false, payload: result });
    });
  } catch (error) {
    res.json({ isError: true, message: "Internal server error" });
  }
};

const DeleteCategory = (req, res) => {
  try {
    if (req.params.id) {
      connection.query(
        "DELETE FROM categories WHERE id =?",
        [req.params.id],
        (error, result) => {
          if (error) {
            return res.json({
              isError: true,
              message: "Something went wrong. Please try again.",
            });
          }
          if (result.affectedRows > 0) {
            res.json({
              isError: false,
              message: "Category deleted successfully!",
            });
          }
        }
      );
    }
  } catch (error) {
    res.json({ isError: true, message: "Internal server error" });
  }
};

module.exports = {
  CreateCategory,
  EditCategory,
  FetchAllCategory,
  DeleteCategory,
};
