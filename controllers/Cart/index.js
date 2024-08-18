require("dotenv").config();
const mongoose = require("mongoose");
const Cart = require("../../config/Db/models/cart");
const { errorResponse } = require("../../lib");

//Done
const AddToCart = async (req, res) => {
  try {
    if (req.body) {
      const { quantity, product_id } = req.body;
      const response = await Cart.updateOne(
        {
          user_id: new mongoose.Types.ObjectId(req.user._id),
          productId: new mongoose.Types.ObjectId(product_id),
        },
        { $inc: { demanded_quantity: Number(quantity) } }
      );

      if (response.modifiedCount > 0) {
        const totalItems = await Cart.countDocuments({
          user_id: new mongoose.Types.ObjectId(req.user._id),
        });
        res.json({
          isError: false,
          total_items: totalItems,
          message: "Order updated",
        });
      } else {
        const newCartItem = new Cart({
          user_id: req.user._id,
          demanded_quantity: Number(quantity),
          productId: product_id,
        });
        await newCartItem.save();
        const totalItems = await Cart.countDocuments({
          user_id: new mongoose.Types.ObjectId(req.user._id),
        });
        res.json({
          isError: false,
          total_items: totalItems,
          message: "Product added to cart successfully.",
        });
      }
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const FetchCartItems = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const cartItems = await Cart.aggregate([
      {
        $match: { user_id: userId },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          name: "$productDetails.name",
          price: "$productDetails.price",
          category: "$productDetails.category",
          images: "$productDetails.images",
          productId: "$productDetails._id",
          demanded_quantity: "$demanded_quantity",
        },
      },
    ]);

    res.json({ isError: false, payload: cartItems });
  } catch (error) {
    errorResponse(error, res);
  }
};

// Done
const RemoveFromCart = async (req, res) => {
  try {
    if (req.params.id) {
      const userId = new mongoose.Types.ObjectId(req.user._id);
      const cartItemId = new mongoose.Types.ObjectId(req.params.id);

      await Cart.deleteOne({ _id: cartItemId });

      const totalItems = await Cart.countDocuments({
        user_id: userId,
      });
      res.json({ isError: false, total_items: totalItems });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};


module.exports = { AddToCart, RemoveFromCart, FetchCartItems };
