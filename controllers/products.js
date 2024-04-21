const appWrite = require("node-appwrite");
const connection = require("../DbConnect");
const { bucketId, generateImageId, storage } = require("../appWrite/index");

const checkEmptyKeys = (object) => {
  for (let key in object) {
    if (object[key] === "") return true;
  }
  return false;
};

const addProduct = async (req, res) => {
  try {
    if (req.params == null) {
      return res.json({ error: "UnAthorised access!" });
    }

    if (req.files == undefined) return res.json({ error: "No file uploaded" });

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
        const file = await storage.createFile(
          bucketId,
          generateImageId(req.files[i]),
          appWrite.InputFile.fromBuffer(
            req.files[i].buffer,
            req.files[i].originalname
          )
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
        quantity: req.body.quantity,
        status: req.body.status,
        imageId: JSON.stringify(uploadImages),
        user_id: req.params.id,
      },
      (error, results) => {
        if (error) {
          console.log(error);
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
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const getAllProducts = (req, res) => {
  try {
    const sql = "SELECT * FROM products ORDER BY createdAt DESC";
    connection.query(sql, (error, result) => {
      if (error) {
        return res.json({
          error: "Something went wrong. Please try again.",
        });
      }

      const parseProductImages = () => {
        if (result.length > 0) {
          for (let i = 0; i < result.length; ) {
            result[i] = {
              ...result[i],
              imageId: JSON.parse(result[i].imageId),
            };
            i++;
            if (i == result.length) return result;
          }
        } else {
          return { products: [] };
        }
      };

      res.json(parseProductImages());
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
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
          result[0] = { ...result[0], imageId: JSON.parse(result[0].imageId) };
          return res.json({ product: result[0] });
        }
        res.json({ error: "Product not found!" });
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
          return res.json({ error: "Something went wrong. Please try again." });
        }

        const parseProductImages = () => {
          if (result.length > 0) {
            for (let i = 0; i < result.length; ) {
              result[i] = {
                ...result[i],
                imageId: JSON.parse(result[i].imageId),
              };
              i++;
              if (i == result.length) return result;
            }
          } else {
            return { products: [] };
          }
        };

        res.json({ products: parseProductImages() });
      });
    } catch (error) {
      res.json({ error: "Internal server error!" });
    }
  }
};

const deleteProduct = (req, res) => {
  try {
    if (req.params) {
      connection.query(
        "SELECT id, imageId FROM products WHERE id = ?",
        [req.params.id],
        (error, result) => {
          if (error) {
            console.log(error);
            return res.json({
              error: "Something went wrong. Please try again.",
            });
          }

          if (result.length > 0) {
            result[0] = {
              ...result[0],
              imageId: JSON.parse(result[0].imageId),
            };
            result[0].imageId.forEach((id) => storage.deleteFile(bucketId, id));

            connection.query(
              "DELETE FROM `products` WHERE id=?",
              [req.params.id],
              (error, result) => {
                if (error) {
                  console.log(error);
                  return res.json({
                    error: "Something went wrong. Please try again.",
                  });
                }

                console.log(result);
                res.json({ message: "Product deleted" });
              }
            );
          }
        }
      );
    }
  } catch (error) {
    console.log(error.message);
    res.json({ error: "Internal server error!" });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductById,
  getByCategory,
  deleteProduct,
};
