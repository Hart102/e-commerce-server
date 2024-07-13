require("dotenv").config();
const mongoose = require("mongoose");
const connection = require("../../config/DbConnect");
const Cart = require("../../config/Db/models/cart");
const { parseProductImages, errorResponse } = require("../../lib/index");

/**
 * Overall, the AddToCart function handles the addition of a product to a user's shopping cart,
 * ensuring that the quantity and size of the product are updated if the item already exists in the cart.
 * If the item does not exist, a new item is added to the cart. The function also returns the total number of items in the cart for the user.
 */

//Done
const AddToCart = async (req, res) => {
  try {
    if (req.body) {
      const { quantity, product_id } = req.body;
      const updateResult = await Cart.updateOne(
        {
          user_id: new mongoose.Types.ObjectId(req.user._id),
          productId: new mongoose.Types.ObjectId(product_id),
        },
        { $inc: { demanded_quantity: Number(quantity) } }
      );

      if (updateResult.modifiedCount > 0) {
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

// Done
const RemoveFromCart = (req, res) => {
  try {
    if (req.params.id) {
      connection.query(
        "DELETE FROM `cart` WHERE id = ?",
        [req.params.id],
        (error) => {
          if (error) {
            res.json({
              isError: true,
              message: "something went wrong please try again.",
            });
          } else {
            const countCartItems = `SELECT COUNT(*) AS total_items FROM cart WHERE user_id=?`;
            connection.query(countCartItems, [req.user.id], (error, result) => {
              if (error) {
                return res.json({
                  isError: true,
                  message: "something went wrong, please try again.",
                });
              }
              res.json({ isError: false, total_items: result[0].total_items });
            });
          }
        }
      );
    }
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

/**
 * Overall, the FetchCartItems function provides a way to retrieve items from a user's shopping cart,
 * ensuring that only authorized users can access their own cart items and handling potential errors gracefully.
 */
const FetchCartItems = (req, res) => {
  try {
    const sql = `
      SELECT 
        products.name, 
        products.price, 
        products.category, 
        products.images, 
        products.id,
        cart.id AS cartId, 
        cart.demanded_quantity 
      FROM 
        cart
      JOIN 
        products ON cart.productId = products.id 
      WHERE 
        cart.user_id = ?`;
    connection.query(sql, [req.user.id], (error, result) => {
      if (error) {
        return res.json({
          isError: true,
          message: "something went wrong please try again.",
        });
      }
      res.json({ isError: false, payload: parseProductImages(result) });
    });
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

module.exports = { AddToCart, RemoveFromCart, FetchCartItems };
