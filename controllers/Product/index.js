require("dotenv").config();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Products = require("../../config/Db/models/products");
const Cart = require("../../config/Db/models/cart");
const { createProductSchema } = require("../../schema/index");
const { errorResponse } = require("../../lib/index");
const {
  storage,
  AppWriteFilesUploader,
} = require("../../config/appWrite/index");


const GetAllProducts = async (req, res) => {
  try {
    const products = await Products.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          quantity: 1,
          status: 1,
          images: 1,
          user_id: 1,
          category: "$categoryDetails.name",
          category_id: "$categoryDetails._id",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.json({ isError: false, payload: products });
  } catch (error) {
    errorResponse(error, res);
  }
};

const CreateProduct = async (req, res) => {
  try {
    if (req.files.length < 1 || req.files < 4) {
      return res.json({
        isError: true,
        message: "Four images are required to create post.",
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
      images: uploadedImageIds,
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
        images: images,
      };
      const result = await Products.updateOne(
        { _id: new ObjectId(id) },
        update
      );
      if (result.modifiedCount > 0) {
        res.json({
          isError: false,
          message: "Product updated successfully",
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
      const product = await Products.findById(new ObjectId(req.body.id));

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

const GetProductById = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    // Aggregate to find the product and its category
    const productWithCategory = await Products.aggregate([
      { $match: { _id: productId } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          description: 1,
          categoryId: 1,
          quantity: 1,
          status: 1,
          images: 1,
          user_id: 1,
          createdAt: 1,
          category_id: "$categoryDetails._id",
          category_name: "$categoryDetails.name",
        },
      },
    ]);
    delete productWithCategory?.categoryDetails;
    if (productWithCategory.length === 0) {
      res.status(404).json({ isError: true, message: "Product not found." });
      return;
    }
    const product = productWithCategory[0];
    res.json({
      isError: false,
      payload: {
        product,
      },
    });
  } catch (error) {
    errorResponse(error, res);
  }
};

const GetProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = await Products.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $match: { "categoryDetails.name": category },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          quantity: 1,
          status: 1,
          images: 1,
          user_id: 1,
          category: "$categoryDetails.name",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.json({ isError: false, payload: products });
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
    let product = await Products.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      res.json({ isError: true, message: "Product not found." });
      return;
    }
    const productImages = product.images;
    for (const imageId of productImages) {
      await storage.deleteFile(process.env.Appwrite_BucketId, imageId);
    }
    const deleteProductFromCart = await Cart.deleteOne({
      productId: new mongoose.Types.ObjectId(productId),
    });

    if (deleteProductFromCart.acknowledged) {
      const deleteProduct = await Products.deleteOne({
        _id: new ObjectId(productId),
      });
      if (deleteProduct.acknowledged) {
        res.json({
          isError: false,
          message: "Product deleted successfully",
        });
      } else {
        res.json({
          isError: true,
          message: "Failed to delete product from cart. Please try again.",
        });
      }
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

module.exports = {
  GetAllProducts,
  CreateProduct,
  EditProduct,
  GetProductById,
  GetProductsByCategory,
  DeleteProduct,
};
