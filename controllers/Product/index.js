require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../../config/DbConnect");
const {
  storage,
  AppWriteFilesUploader,
} = require("../../config/appWrite/index");
const { createProductSchema } = require("../../schema/index");
const { parseProductImages } = require("../../lib/index");

const CreateProduct = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, async (err, user) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      if (req.files.length < 1 || req.files < 4) {
        return res.json({
          error: "Four product images required to create post.",
        });
      }
      for (let i = 0; i < req.files.length; i++) {
        if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return res.json({
            error: "Only JPG, JPEG, or PNG files are allowed",
          });
        }
      }
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      const uploadImageIds = await AppWriteFilesUploader(req.files);
      connection.query(
        "INSERT INTO products SET ?",
        {
          name: value.name.toLowerCase(),
          price: value.price,
          description: value.description.toLowerCase(),
          category: value.category.toLowerCase(),
          quantity: Number(value.quantity),
          status: value.status,
          images: JSON.stringify(uploadImageIds),
          user_id: user.id,
        },
        (error, results) => {
          if (error) {
            return res.json({
              error: "Something went wrong. Please try again.",
            });
          }
          res.json({
            message: "Upload successful",
            productId: results.insertId,
          });
        }
      );
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const EditProduct = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, async (err) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      const { error } = createProductSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      let uploadImageIds;
      if (req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return res.json({
              error: "Only JPG, JPEG, or PNG files are allowed",
            });
          }
        }
        uploadImageIds = await AppWriteFilesUploader(req.files);
        const replacedImageIds = JSON.parse(req.body.replacedImageIds);
        for (let i = 0; i < replacedImageIds.length; i++) {
          storage.deleteFile(
            process.env.Appwrite_BucketId,
            replacedImageIds[i]
          );
        }
      }
      // REUSED
      const update_database = (images) => {
        const { id, name, price, description, category, quantity, status } =
          req.body;
        connection.query(
          `UPDATE products 
            SET name = ?, price = ?, description = ?, category = ?, quantity = ?, status = ?, images = ? 
            WHERE id = ?`,
          [
            name.toLowerCase(),
            price,
            description.toLowerCase(),
            category.toLowerCase(),
            quantity,
            status.toLowerCase(),
            JSON.stringify(images),
            id,
          ],
          (error, response) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
            if (response.affectedRows) {
              res.json({
                message: "Product edited successfully",
              });
            }
          }
        );
      };
      if (uploadImageIds !== undefined) {
        const replacedImageIds = JSON.parse(req.body.replacedImageIds);
        connection.query(
          "SELECT images FROM products WHERE id =?",
          [req.body.id],
          async (error, productImages) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
            productImages = JSON.parse(productImages[0].images);
            const changedImages = (images) => {
              if (images) {
                for (let i = 0; i < images.length; i++) {
                  for (let j = 0; j < replacedImageIds.length; j++) {
                    if (images[i] === replacedImageIds[j]) {
                      images[i] = uploadImageIds[j];
                      break;
                    }
                  }
                }
                return images;
              }
            };
            const updatedImageIds = changedImages(productImages);
            update_database(updatedImageIds); //Update DB
          }
        );
      } else {
        const existingImageIds = JSON.parse(req.body.images);
        update_database(existingImageIds); //Update DB
      }
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const DeleteProduct = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }
      if (req.params.id) {
        connection.query(
          "SELECT id, images FROM products WHERE id = ?",
          [req.params.id],
          async (error, result) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
            if (result.length > 0) {
              result[0] = {
                ...result[0],
                images: JSON.parse(result[0].images),
              };
              for (const image_id of result[0].images) {
                await storage.deleteFile(
                  process.env.Appwrite_BucketId,
                  image_id
                );
              }
              connection.query(
                "DELETE FROM cart WHERE productId=?",
                [req.params.id],
                (err) => {
                  if (err) {
                    res.json({
                      error:
                        "Something went wrong while deleting item. Please try again.",
                    });
                  } else {
                    connection.query(
                      "DELETE FROM `products` WHERE id=?",
                      [req.params.id],
                      (error) => {
                        if (error) {
                          return res.json({
                            error:
                              "Something went wrong while deleting item. Please try again.",
                          });
                        }
                        res.json({ message: "Product deleted" });
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const GetProductsByUserId = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }
      const sql =
        "SELECT * FROM products WHERE user_id =? ORDER BY createdAt DESC";
      connection.query(sql, [user.id], (error, products) => {
        if (error) {
          return res.json({
            error: "something went wrong. Please try again.",
          });
        }
        res.json(parseProductImages(products));
      });
    });
  } catch (error) {
    res.json({ error: "internal server error!" });
  }
};

const GetProductById = (req, res) => {
  try {
    connection.query(
      "SELECT * FROM products WHERE id=?",
      [req.params.id],
      (err, result) => {
        if (err) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        if (result.length > 0) {
          result[0] = {
            ...result[0],
            imageId: JSON.parse(result[0].imageId),
          };
          return res.json(result[0]);
        } else {
          res.json({ error: "Product not found!" });
        }
      }
    );
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const GetByCategory = (req, res) => {
  if (req.params.category) {
    try {
      const sql = `SELECT * FROM products WHERE category=? ORDER BY createdAt DESC`;
      connection.query(sql, [req.params.category], (error, result) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        const products = parseProductImages(result);
        res.json(products);
      });
    } catch (error) {
      res.json({ error: "Internal server error!" });
    }
  }
};

module.exports = {
  CreateProduct,
  EditProduct,
  DeleteProduct,
  GetProductsByUserId,
  GetProductById,
  GetByCategory,
};
