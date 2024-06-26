require("dotenv").config();
const axios = require("axios");
const connection = require("../../config/DbConnect");
const { OrderSchema } = require("../../schema/index");
const { initializePayment } = require("../../config/acceptPayment");
const { parseProductImages } = require("../../lib");

const GetUncompletedOrderByuserId = (req, res) => {
  try {
    connection.query(
      "SELECT id, payment_status FROM orders WHERE user_id = ? AND payment_status IS NULL",
      [req.user.id, false],
      (error, uncompletedOrder) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        res.json(uncompletedOrder);
      }
    );
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

//Done
const AcceptPayment = async (req, res) => {
  try {
    const { error, value } = OrderSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    const amountInKobo = parseFloat(value.totalPrice);
    const response = await initializePayment({
      email: req.user.email,
      amount: amountInKobo,
      name: `${req.user.firstName} ${req.user.lastName}`,
    });
    if (response.error) {
      return res.json({ error: response.error });
    }
    if (response.data.status === true) {
      for (let i = 0; i < value.products.length; i++) {
        connection.query(
          "INSERT INTO orders SET?",
          {
            user_id: req.user?.id,
            shipping_address_id: value?.addressId,
            product_id: value.products[i].productId,
            demanded_quantity: value.products[i].demandedQuantity,
            total_price: `NGN ${value.products[i].price}`,
            transaction_reference: response.data.data.reference,
          },
          (error) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
          }
        );
      }
      res.json({
        payment_url: response.data.data.authorization_url,
      });
    }
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

//Done
const confirmPayment = (req, res) => {
  try {
    const sql = `SELECT id, transaction_reference FROM orders WHERE id = (SELECT MAX(id) FROM orders WHERE user_id = ?)`;
    connection.query(sql, [req.user.id], async (err, order) => {
      if (err) {
        return res.json({
          error: "Something went wrong. Please try again.",
        });
      }
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${order[0].transaction_reference}`,
        {
          headers: { Authorization: `Bearer ${process.env.Test_Secret_Key}` },
        }
      );
      const { data } = await response;
      if (data.status) {
        connection.query(
          "UPDATE orders SET payment_status =? WHERE transaction_reference =?",
          [data.data.status, order[0].transaction_reference],
          (error) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
            res.json({
              message: `Payment status: ${data.data.status}`,
            });
          }
        );
      } else {
        res.json({
          error: "Payment verification failed. Please try again.",
        });
      }
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const FetchAllOrders = (req, res) => {
  try {
    const sql = `SELECT orders.*, products.images, products.name, users.firstname FROM orders JOIN 
      products ON orders.product_id = products.id JOIN users ON orders.user_id = users.id ORDER BY orders.id DESC`;

    connection.query(sql, (error, orders) => {
      if (error) {
        return res.json({
          error: "Something went wrong. Please try again.",
        });
      }
      res.json(parseProductImages(orders));
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const FetChCustomerAndOrderDeatils = (req, res) => {
  try {
    const sql = `SELECT * FROM orders, users, address WHERE orders.id =?  AND users.id = orders.user_id AND address.id = orders.shipping_address_id`;
    connection.query(sql, [req.params.orderId], (error, result) => {
      if (error) {
        return res.json({
          error: "Something went wrong. Please try again.",
        });
      }
      res.json(result[0]);
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const FetchOrdersAndProduct = (req, res) => {
  try {
    const sql = `SELECT * FROM orders, products WHERE orders.user_id =? AND orders.transaction_reference = ? AND products.id = orders.product_id`;
    connection.query(
      sql,
      [req.body.userId, req.body.orderId],
      (error, result) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        res.json(parseProductImages(result));
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const DeleteOrder = (req, res) => {
  try {
    connection.query(
      "DELETE FROM orders WHERE id = ?",
      [req.params.id],
      (error, response) => {
        if (error) {
          return res.json({
            error: "Something went wrong. Please try again.",
          });
        }
        if (response.affectedRows > 0) {
          return res.json({
            message: "Record deleted successfully",
          });
        }
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

module.exports = {
  AcceptPayment,
  confirmPayment,
  GetUncompletedOrderByuserId,
  FetchAllOrders,
  FetChCustomerAndOrderDeatils,
  FetchOrdersAndProduct,
  DeleteOrder,
};

// const addPaymentCard = (req, res) => {
//   try {
//     const token = req.header("Authorization");
//     jwt.verify(token, process.env.Authentication_Token, (err, user) => {
//       if (err) {
//         return res.json({ error: "invalid authentication token!" });
//       }
//       const { error, value } = paymentCardSchema.validate(req.body);
//       if (error) {
//         return res.json({ error: error.details[0].message });
//       }
//       let sql =
//         "SELECT COUNT(*) AS total_address FROM payment_cards WHERE user_id = ?";

//       connection.query(sql, [user.id], (err, counts) => {
//         if (err) {
//           return res.json({
//             error: "Something went wrong, please try again.",
//           });
//         }
//         if (counts[0].total_address > 1) {
//           return res.json({
//             error: "User cannot have more than two payment cards",
//           });
//         }
//         connection.query(
//           "INSERT INTO payment_cards SET?",
//           {
//             user_id: user.id,
//             card_number: value.card_number,
//             card_name: value.card_name,
//             expiry_date: value.expiry_date,
//             cvv: value.cvv,
//           },
//           (error, results) => {
//             if (error) {
//               return res.json({
//                 error: "Something went wrong. Please try again.",
//               });
//             }
//             res.json({
//               message: "Payment card added successfully",
//               paymentCardId: results.insertId,
//             });
//           }
//         );
//       });
//     });
//   } catch (error) {
//     res.json({ error: "Internal server error!" });
//   }
// };

// const getPaymentCard = (req, res) => {
//   try {
//     const token = req.header("Authorization");
//     jwt.verify(token, process.env.Authentication_Token, (err, user) => {
//       if (err) {
//         return res.json({ error: "invalid authentication token!" });
//       }
//       connection.query(
//         "SELECT * FROM payment_cards WHERE user_id = ?",
//         [user.id],
//         (error, cards) => {
//           if (error) {
//             return res.json({
//               error: "Something went wrong. Please try again.",
//             });
//           }
//           res.json({ cards });
//         }
//       );
//     });
//   } catch (error) {
//     res.json({ error: "Internal server error!" });
//   }
// };

// const FetchAllOrders = (req, res) => {
//   try {
//     const token = req.header("Authorization");
//     jwt.verify(token, process.env.Authentication_Token, (err, user) => {
//       if (err) {
//         return res.json({ error: "invalid authentication token!" });
//       }
//       const sql = `SELECT orders.*, products.images, products.name, users.firstname FROM orders JOIN
//       products ON orders.product_id = products.id JOIN users ON orders.user_id = users.id WHERE orders.user_id = ? ORDER BY orders.id DESC`;

//       connection.query(sql, [user.id], (error, orders) => {
//         if (error) {
//           return res.json({
//             error: "Something went wrong. Please try again.",
//           });
//         }
//         res.json(parseProductImages(orders));
//       });
//     });
//   } catch (error) {
//     res.json({ error: "internal server error" });
//   }
// };
