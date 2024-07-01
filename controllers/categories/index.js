require("dotenv").config();
const connection = require("../../config/DbConnect");
const { categorySchema } = require("../../schema/index");

const CreateCategory = (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    connection.query(
      "INSERT INTO categories SET?",
      { name: value.name.toLowerCase(), status: value.status },
      (error, result) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        if (result.affectedRows > 0) {
          res.json({ message: "Category created successfully!" });
        }
      }
    );
  } catch (error) {
    res.json("internal server error");
  }
};

const EditCategory = (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    connection.query(
      "UPDATE categories SET? WHERE id =?",
      [{ name: value.name.toLowerCase(), status: value.status }, req.params.id],
      (error, result) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        if (result.affectedRows > 0) {
          res.json({ message: "Category updated successfully!" });
        }
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
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
          error: "Something went wrong. Please try again.",
        });
      }
      res.json(result);
    });
  } catch (error) {
    res.json({ error: "Internal server error" });
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
              error: "Something went wrong. Please try again.",
            });
          }
          if (result.affectedRows > 0) {
            res.json({ message: "Category deleted successfully!" });
          }
        }
      );
    }
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
};

module.exports = {
  CreateCategory,
  EditCategory,
  FetchAllCategory,
  DeleteCategory,
};
