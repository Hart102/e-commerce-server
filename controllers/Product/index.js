require("dotenv").config();
const connection = require("../../config/DbConnect");
const {
  storage,
  AppWriteFilesUploader,
} = require("../../config/appWrite/index");
const { createProductSchema } = require("../../schema/index");
const { ObjectId } = require("mongodb");
const { parseProductImages, errorResponse } = require("../../lib/index");
const Products = require("../../config/Db/models/products");

const GetAllProducts = async (req, res) => {
  try {
    const products = await Products.find();
    res.json({ isError: false, payload: parseProductImages(products) });
  } catch (error) {
    errorResponse(error, res);
  }
};

const CreateProduct = async (req, res) => {
  try {
    if (req.files.length < 1 || req.files < 4) {
      return res.json({
        isError: true,
        message: "Four product images required to create post.",
      });
    }
    for (let i = 0; i < req.files.length; i++) {
      if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return res.json({
          isError: true,
          message: "Only JPG, JPEG, or PNG files are allowed",
        });
      }
    }
    const uploadedImageIds = await AppWriteFilesUploader(req.files);
    const new_product = new Products({
      name: req.body.name.toLowerCase(),
      price: req.body.price,
      description: req.body.description.toLowerCase(),
      category: req.body.category.toLowerCase(),
      quantity: Number(req.body.quantity),
      status: req.body.status,
      images: JSON.stringify(uploadedImageIds),
      user_id: req.user._id,
    });
    await new_product.save();
    res.json({
      isError: false,
      message: "Upload successful",
    });
  } catch (error) {
    errorResponse(error, res);
  }
};

const EditProduct = async (req, res) => {
  try {
    const { error } = createProductSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    let uploadImageIds;
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        if (!req.files[i].originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return res.json({
            isError: true,
            message: "Only JPG, JPEG, or PNG files are allowed",
          });
        }
      }
      uploadImageIds = await AppWriteFilesUploader(req.files);
      const replacedImageIds = JSON.parse(req.body.replacedImageIds);
      for (let i = 0; i < replacedImageIds.length; i++) {
        storage.deleteFile(process.env.Appwrite_BucketId, replacedImageIds[i]);
      }
    }
    // REUSED
    const updateDatabase = async (images) => {
      const { id, name, price, description, category, quantity, status } =
        req.body;
      const update = {
        name: name.toLowerCase(),
        price,
        description: description.toLowerCase(),
        category: category.toLowerCase(),
        quantity,
        status: status.toLowerCase(),
        images: JSON.stringify(images),
      };
      const result = await Products.updateOne({ _id: id }, update);

      if (result.modifiedCount > 0) {
        res.json({
          isError: false,
          message: "Product edited successfully",
        });
      } else {
        res.json({
          isError: true,
          message: "Something went wrong. Please try again.",
        });
      }
    };
    if (uploadImageIds !== undefined) {
      const replacedImageIds = JSON.parse(req.body.replacedImageIds);
      const product = await Products.findById(req.body.id);

      const productImages = JSON.parse(product.images);
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
      await updateDatabase(updatedImageIds); // Update DB with New Images
    } else {
      const existingImageIds = JSON.parse(req.body.images);
      updateDatabase(existingImageIds); //Update DB With Existing Images
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const GetProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = await Products.find({ category }).sort({ createdAt: -1 });
    const parsedProducts = parseProductImages(products);

    res.json({ isError: false, message: "", payload: parsedProducts });
  } catch (error) {
    errorResponse(error, res);
  }
};

const DeleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      res.json({ isError: true, message: "Product Id is required." });
      return;
    }
    let product = await Product.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.json({ isError: true, message: "Product not found." });
    }
    const productImages = JSON.parse(product.images);
    for (const imageId of productImages) {
      await storage.deleteFile(process.env.Appwrite_BucketId, imageId);
    }

    // if (req.params.id) {
    //   connection.query(
    //     "SELECT id, images FROM products WHERE id = ?",
    //     [req.params.id],
    //     async (error, result) => {
    //       if (error) {
    //         return res.json({
    //           isError: true,
    //           message: "Something went wrong. Please try again.",
    //         });
    //       }
    //       if (result.length > 0) {
    //         result[0] = {
    //           ...result[0],
    //           images: JSON.parse(result[0].images),
    //         };
    //         for (const image_id of result[0].images) {
    //           await storage.deleteFile(process.env.Appwrite_BucketId, image_id);
    //         }
    //         connection.query(
    //           "DELETE FROM cart WHERE productId=?",
    //           [req.params.id],
    //           (err) => {
    //             if (err) {
    //               res.json({
    //                 isError: true,
    //                 message:
    //                   "Something went wrong while deleting item. Please try again.",
    //               });
    //             } else {
    //               connection.query(
    //                 "DELETE FROM `products` WHERE id=?",
    //                 [req.params.id],
    //                 (error) => {
    //                   if (error) {
    //                     return res.json({
    //                       isError: true,
    //                       message:
    //                         "Something went wrong while deleting item. Please try again.",
    //                     });
    //                   }
    //                   res.json({ isError: false, message: "Product deleted" });
    //                 }
    //               );
    //             }
    //           }
    //         );
    //       }
    //     }
    //   );
    // }
  } catch (error) {
    res.json({ isError: true, message: "Internal server error!" });
  }
};

module.exports = {
  GetAllProducts,
  GetProductsByCategory,
  CreateProduct,
  EditProduct,
  DeleteProduct,
};


// const GetProductById = (req, res) => {
//   try {
//     if (req.params.id) {
//       connection.query(
//         "SELECT * FROM products WHERE id=?",
//         [req.params.id],
//         (err, result) => {
//           if (err) {
//             return res.json({
//               error: "Something went wrong. Please try again.",
//             });
//           }
//           if (result.length > 0) {
//             result[0] = {
//               ...result[0],
//               imageId: JSON.parse(result[0].imageId),
//             };
//             return res.json(result[0]);
//           } else {
//             res.json({ error: "Product not found!" });
//           }
//         }
//       );
//     }
//   } catch (error) {
//     res.json({ error: "Internal server error!" });
//   }
// };