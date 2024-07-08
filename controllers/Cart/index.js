require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../../config/DbConnect");
const { parseProductImages } = require("../../lib/index");

/**
 * Overall, the AddToCart function handles the addition of a product to a user's shopping cart,
 * ensuring that the quantity and size of the product are updated if the item already exists in the cart.
 * If the item does not exist, a new item is added to the cart. The function also returns the total number of items in the cart for the user.
 */
const AddToCart = (req, res) => {
  try {
    if (req.body) {
      // An SQL query to update the quantity of an existing product in the cart
      let sql = `UPDATE cart SET demanded_quantity = demanded_quantity + ${Number(
        req.body.quantity
      )} WHERE user_id = ${req.user.id} AND productId = ${req.body.productId}`;
      connection.query(sql, (error, result) => {
        if (error) {
          return res.json({
            isError: true,
            message: "something went wrong, please try again.",
          });
        }
        const countCartItems = `SELECT COUNT(*) AS total_items FROM cart WHERE user_id=?`;
        // If the product already exists in the cart, return the total number of items
        if (result.affectedRows > 0) {
          connection.query(countCartItems, [req.user.id], (error, result) => {
            if (error) {
              return res.json({
                isError: true,
                message: "something went wrong, please try again.",
              });
            }
            res.json({ total_items: result[0].total_items });
          });
        } else {
          // If the product does not exist in the cart, prepare an SQL query to insert a new item
          sql =
            "INSERT INTO cart (user_id, demanded_quantity, productId) VALUES (?, ?, ?)";
          connection.query(
            sql,
            [req.user.id, req.body.quantity, req.body.productId],
            (error) => {
              if (error) {
                return res.json({
                  isError: true,
                  message: "something went wrong. Please try again.",
                });
              }
              // Return the total number of items in the user's cart
              connection.query(
                countCartItems,
                [req.user.id],
                (error, result) => {
                  if (error) {
                    return res.json({
                      isError: true,
                      message: "something went wrong, please try again.",
                    });
                  }
                  res.json({
                    isError: false,
                    total_items: result[0].total_items,
                  });
                }
              );
            }
          );
        }
      });
    }
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
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
