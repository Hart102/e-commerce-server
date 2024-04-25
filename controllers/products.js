const jwt = require("jsonwebtoken");
const appWrite = require("node-appwrite");
const connection = require("../DbConnect");
const { bucketId, storage } = require("../appWrite/index");

const checkEmptyKeys = (object) => {
  for (let key in object) {
    if (object[key] === "") return true;
  }
  return false;
};

const parseProductImages = (products) => {
  if (products.length > 0) {
    for (let i = 0; i < products.length; ) {
      products[i] = {
        ...products[i],
        imageId: JSON.parse(products[i].imageId),
      };
      i++;
      if (i == products.length) return products;
    }
  } else {
    return { products: [] };
  }
};

const addProduct = async (req, res) => {
  try {
    const token = req.header("Authorization");

    jwt.verify(token, "tokenabc", async (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }

      if (req.files == undefined) {
        return res.json({ error: "No file uploaded" });
      }

      for (let i = 0; i < req.files.length; ) {
        if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return res.json({
            error: "Only JPG, JPEG, or PNG files are allowed",
          });
        }
        i++;
      }

      const brand = req.body.brand;
      delete req.body.brand;

      if (checkEmptyKeys(req.body)) {
        return res.json({ error: "All fields are required!" });
      }

      const uploadFiles = async () => {
        const files = [];
        for (let i = 0; i < req.files.length; ) {
          const uniqueImageId = Math.random().toString(36).substring(2, 8);
          const uniqueFilename =
            Math.random().toString(36).substring(2, 8) +
            "-" +
            req.files[i].originalname;

          const file = await storage.createFile(
            bucketId,
            uniqueImageId,
            appWrite.InputFile.fromBuffer(req.files[i].buffer, uniqueFilename)
          );
          files.push(file.$id);

          i++;
          if (files.length == req.files.length) return files;
        }
      };

      const uploadImages = await uploadFiles();
      connection.query(
        "INSERT INTO products SET ?",
        {
          name: req.body.name.toLowerCase(),
          price: parseFloat(req.body.price),
          description: req.body.description.toLowerCase(),
          category: req.body.category.toLowerCase(),
          units: req.body.quantity,
          brand: brand,
          status: req.body.status,
          imageId: JSON.stringify(uploadImages),
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

const getAllProducts = (req, res) => {
  try {
    const token = req.header("Authorization");

    jwt.verify(token, "tokenabc", (error) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }

      const sql = "SELECT * FROM products ORDER BY createdAt DESC";
      connection.query(sql, (error, result) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        res.json(parseProductImages(result));
      });
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const getProductById = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (error) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }
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
    });
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
          return res.json({ error: "Something went wrong. Please try again." });
        }
        const products = parseProductImages(result);
        res.json(products);
      });
    } catch (error) {
      res.json({ error: "Internal server error!" });
    }
  }
};

const deleteProduct = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }

      if (req.params) {
        connection.query(
          "SELECT id, imageId FROM products WHERE id = ?",
          [req.params.id],
          (error, result) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }

            if (result.length > 0) {
              result[0] = {
                ...result[0],
                imageId: JSON.parse(result[0].imageId),
              };
              result[0].imageId.forEach((id) =>
                storage.deleteFile(bucketId, id)
              );

              connection.query(
                "DELETE FROM `products` WHERE id=?",
                [req.params.id],
                (error) => {
                  if (error) {
                    return res.json({
                      error: "Something went wrong. Please try again.",
                    });
                  }
                  res.json({ message: "Product deleted" });
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

const addToCart = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }

      if (req.body) {
        let sql = `UPDATE cart SET demanded_unit = demanded_unit + ${Number(
          req.body.units
        )} WHERE userId = ${user.id} AND productId = ${req.body.productId}`;

        connection.query(sql, (error, result) => {
          if (error) {
            return res.json({
              error: "something went wrong, please try again.",
            });
          }

          const countCartItems = `SELECT COUNT(*) AS total_items FROM cart WHERE userId=?`;
          if (result.affectedRows > 0) {
            // RETURN TOTAL NUMBER OF ITEMS USER HAS IN CART
            connection.query(
              countCartItems,
              [req.body.userId],
              (error, result) => {
                if (error) {
                  console.log(error);

                  return res.json({
                    error: "something went wrong, please try again.",
                  });
                }
                res.json({ response: result[0] });
              }
            );
          } else {
            sql =
              "INSERT INTO cart (userId, demanded_unit, productId) VALUES (?, ?, ?)";
            connection.query(
              sql,
              [user.id, req.body.units, req.body.productId],
              (error) => {
                if (error) {
                  return res.json({
                    error: "something went wrong. Please try again.",
                  });
                }
                // RETURN TOTAL NUMBER OF ITEMS USER HAS IN CART
                connection.query(countCartItems, [user.id], (error, result) => {
                  if (error) {
                    return res.json({
                      error: "something went wrong, please try again.",
                    });
                  }
                  res.json({ response: result[0] });
                });
              }
            );
          }
        });
      }
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const getCartItems = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }

      const sql =
        "SELECT cart. id, demanded_unit, products. name, price, description, category, brand, imageId FROM cart INNER JOIN products ON cart.productId = products.id WHERE cart.userId = ?";

      connection.query(sql, [user.id], (error, result) => {
        if (error) {
          return res.json({
            error: "something went wrong please try again.",
          });
        }
        const products = parseProductImages(result);
        res.json(products);
      });
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const removeFromCart = (req, res) => {
  try {
    if (req.params.id) {
      connection.query(
        "DELETE FROM `cart` WHERE id = ?",
        [req.params.id],
        (error, response) => {
          if (error) {
            return res.json({
              error: "something went wrong please try again.",
            });
          }

          const countCartItems = `SELECT COUNT(*) AS total_items FROM cart WHERE userId=?`;
          connection.query(
            countCartItems,
            [req.body.userId],
            (error, result) => {
              if (error) {
                return res.json({
                  error: "something went wrong, please try again.",
                });
              }
              res.json({
                message: "item removed",
                total_items: result[0].total_items,
              });
            }
          );
        }
      );
    }
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductById,
  getByCategory,
  deleteProduct,
  addToCart,
  getCartItems,
  removeFromCart,
};
