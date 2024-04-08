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
    if (!req.params) {
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
module.exports = { addProduct, getProductById };
