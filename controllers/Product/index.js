require("dotenv").config();
const jwt = require("jsonwebtoken");
const appWrite = require("node-appwrite");
const connection = require("../../config/DbConnect");
const { storage } = require("../../config/appWrite/index");
const { createProductSchema } = require("../../schema/index");
const { parseProductImages } = require("../../lib/index");

const createProduct = async (req, res) => {
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
      for (let i = 0; i < req.files.length; ) {
        if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return res.json({
            error: "Only JPG, JPEG, or PNG files are allowed",
          });
        }
        i++;
      }
      // Validate the product data using the createProductSchema
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      // Function to upload images to Appwrite storage
      const uploadFiles = async () => {
        const files = [];
        for (let i = 0; i < req.files.length; ) {
          const uniqueImageId = Math.random().toString(36).substring(2, 8);
          const uniqueFilename =
            Math.random().toString(36).substring(2, 8) +
            "-" +
            req.files[i].originalname;

          const file = await storage.createFile(
            process.env.Appwrite_BucketId,
            uniqueImageId,
            appWrite.InputFile.fromBuffer(req.files[i].buffer, uniqueFilename)
          );
          files.push(file.$id);
          i++;
          if (files.length == req.files.length) return files;
        }
      };
      // Upload the images and get the file IDs
      const uploadImages = await uploadFiles();
      // Insert the product data into the database
      connection.query(
        "INSERT INTO products SET ?",
        {
          name: value.name.toLowerCase(),
          price: value.price,
          description: value.description.toLowerCase(),
          category: value.category.toLowerCase(),
          quantity: Number(value.quantity),
          status: value.status,
          images: JSON.stringify(uploadImages),
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

const deleteProduct = (req, res) => {
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

const getProductsByUserId = (req, res) => {
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

const getProductById = (req, res) => {
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
          console.log(result);
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

const getByCategory = (req, res) => {
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
  getProductsByUserId,
  createProduct,
  getProductById,
  getByCategory,
  deleteProduct,
};
