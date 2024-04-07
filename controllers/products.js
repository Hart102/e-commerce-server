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
    if (req.session.user == undefined)
      return res.json({ error: "UnAthorised access!" });

    if (req.file == undefined) return res.json({ error: "No file uploaded" });

    if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return res.json({
        error: "Only JPG, JPEG, or PNG files are allowed",
      });
    }
    if (checkEmptyKeys(req.body)) {
      return res.json({ error: "All fields are required!" });
    }

    const file = await storage.createFile(
      bucketId,
      generateImageId(req.file),
      appWrite.InputFile.fromBuffer(req.file.buffer, req.file.originalname)
    );

    connection.query(
      "INSERT INTO products SET ?",
      {
        name: req.body.name,
        price: Number(req.body.price),
        description: req.body.description,
        category: req.body.category,
        quantity: req.body.quantity,
        imageId: file.$id,
        user_id: req.session.user.id,
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
        if (result.length > 0) return res.json({ product: result[0] });
        res.json({ error: "Product not found!" });
      }
    );
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};
module.exports = { addProduct, getProductById };
