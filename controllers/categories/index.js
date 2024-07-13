require("dotenv").config();
const mongoose = require("mongoose");
const Categories = require("../../config/Db/models/categories");
const { categorySchema } = require("../../schema/index");
const { errorResponse } = require("../../lib/index");

const CreateCategory = async (req, res) => {
  try {
    const newCategory = new Categories({
      name: req.body.name.toLowerCase(),
      status: req.body.status,
    });
    const saved = await newCategory.save();
    if (saved) {
      res.json({
        isError: false,
        message: "Category created successfully!",
      });
    } else {
      res.json({
        isError: true,
        message: "Something went wrong. Please try again.",
      });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const EditCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const updatedCategory = await Categories.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { name: value.name.toLowerCase(), status: value.status } }
    );
    if (updatedCategory.modifiedCount > 0) {
      res.json({
        isError: false,
        message: "Category updated successfully!",
      });
    } else {
      res.json({
        isError: true,
        message: "No changes made.",
      });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const FetchAllCategory = async (req, res) => {
  try {
    const categories = await Categories.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          product_count: { $size: "$products" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          products: 0,
        },
      },
    ]);
    res.json({ isError: false, payload: categories });
  } catch (error) {
    errorResponse(error, res);
  }
};

const DeleteCategory = async (req, res) => {
  try {
    if (req.params.id) {
      const result = await Categories.deleteOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });

      if (result.deletedCount > 0) {
        res.json({
          isError: false,
          message: "Deleted",
        });
      } else {
        res.json({
          isError: true,
          message: "Category not found.",
        });
      }
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

module.exports = {
  CreateCategory,
  EditCategory,
  FetchAllCategory,
  DeleteCategory,
};
