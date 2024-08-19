require("dotenv").config();
// const axios = require("axios");
const { OrderSchema } = require("../../schema/index");
const { initializePayment } = require("../../config/acceptPayment");
const {  errorResponse } = require("../../lib");
// const Order = require("../../config/Db/models/orders");

const FetchUncompletedOrderByuserId = (req, res) => {
  try {
    // connection.query(
    //   "SELECT payment_status FROM orders WHERE user_id = ? AND payment_status IS NULL",
    //   [req.user.id, false],
    //   (error, uncompletedOrder) => {
    //     if (error) {
    //       return res.json({
    //         isError: true,
    //         message: "Something went wrong. Please try again.",
    //       });
    //     }
    //     res.json({ isError: false, payload: uncompletedOrder });
    //   }
    // );
  } catch (error) {
    res.json({ isError: true, message: "Internal server error!" });
  }
};

//Done
const AcceptPayment = async (req, res) => {
  try {
    const { error, value } = OrderSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }

    const amountInKobo = parseFloat(value.totalPrice);
    const response = await initializePayment({
      email: req.user.email,
      amount: amountInKobo,
      name: `${req.user.firstName} ${req.user.lastName}`,
    });

    if (response.error) {
      return res.json({ isError: true, message: response.error });
    }

    if (response.data.status === true) {
      const orders = value.products.map((product) => ({
        user_id: req.user._id,
        shipping_address_id: value.addressId,
        product_id: product.productId,
        demanded_quantity: product.demandedQuantity,
        total_price: `NGN ${product.price}`,
        transaction_reference: response.data.data.reference,
      }));

      console.log(orders);
      // const response = Order.insertMany(orders)
    }

    // const { error, value } = OrderSchema.validate(req.body);
    // if (error) {
    //   return res.json({ isError: true, message: error.details[0].message });
    // }
    // const amountInKobo = parseFloat(value.totalPrice);
    // const response = await initializePayment({
    //   email: req.user.email,
    //   amount: amountInKobo,
    //   name: `${req.user.firstName} ${req.user.lastName}`,
    // });
    // if (response.error) {
    //   return res.json({ isError: true, message: response.error });
    // }
    // let storageCount = 0;
    // if (response.data.status === true) {
    //   for (let i = 0; i < value.products.length; i++) {
    //     storageCount++;
    //     connection.query(
    //       "INSERT INTO orders SET?",
    //       {
    //         user_id: req.user?.id,
    //         shipping_address_id: value?.addressId,
    //         product_id: value.products[i].productId,
    //         demanded_quantity: value.products[i].demandedQuantity,
    //         total_price: `NGN ${value.products[i].price}`,
    //         transaction_reference: response.data.data.reference,
    //       },
    //       (error) => {
    //         if (error) {
    //           return res.json({
    //             isError: true,
    //             message: "Something went wrong. Please try again.",
    //           });
    //         }
    //         if (storageCount == value.products.length) {
    //           res.json({
    //             isError: false,
    //             message: "Payment accepted successfully!",
    //             payment_url: response.data.data.authorization_url,
    //           });
    //           storageCount = 0;
    //         }
    //       }
    //     );
    //   }
    // }
  } catch (error) {
    errorResponse(error, res);
  }
};

//Done
// abandoned;
const ConfirmPayment = (req, res) => {
  // try {
  //   const sql = `SELECT id, transaction_reference FROM orders WHERE id = (SELECT MAX(id) FROM orders WHERE user_id = ?)`;
  //   connection.query(sql, [req.user.id], async (err, order) => {
  //     if (err) {
  //       return res.json({
  //         isError: true,
  //         message: "Something went wrong. Please try again.",
  //       });
  //     }
  //     const response = await axios.get(
  //       `https://api.paystack.co/transaction/verify/${order[0].transaction_reference}`,
  //       {
  //         headers: { Authorization: `Bearer ${process.env.Test_Secret_Key}` },
  //       }
  //     );
  //     const { data } = await response;
  //     if (data.status) {
  //       if (data.data.status == "abandoned") {
  //         connection.query(
  //           "SELECT id FROM orders WHERE transaction_reference =?",
  //           [order[0].transaction_reference],
  //           (error, response) => {
  //             if (error) {
  //               return res.json({
  //                 isError: true,
  //                 message: "Something went wrong please try again.",
  //               });
  //             }
  //             // Delete abandoned order
  //             let deleteCount = 0;
  //             response.map((order) => {
  //               connection.query(
  //                 "DELETE FROM orders WHERE id =?",
  //                 [order.id],
  //                 (error) => {
  //                   deleteCount++;
  //                   if (error) {
  //                     return res.json({
  //                       isError: true,
  //                       message: "Something went wrong please try again.",
  //                     });
  //                   } else {
  //                     if (deleteCount == response.length) {
  //                       res.json({
  //                         isError: true,
  //                         message:
  //                           "Payment abandoned. Please try checking out again.",
  //                       });
  //                       deleteCount = 0;
  //                     }
  //                   }
  //                 }
  //               );
  //             });
  //           }
  //         );
  //       } else {
  //         connection.query(
  //           "UPDATE orders SET payment_status =? WHERE transaction_reference =?",
  //           [data.data.status, order[0].transaction_reference],
  //           (error) => {
  //             if (error) {
  //               return res.json({
  //                 isError: true,
  //                 message: "Something went wrong. Please try again.",
  //               });
  //             }
  //             res.json({
  //               isError: false,
  //               message: `Payment status: ${data.data.status}`,
  //             });
  //           }
  //         );
  //       }
  //     } else {
  //       res.json({
  //         isError: true,
  //         message: "Payment verification failed. Please try again.",
  //       });
  //     }
  //   });
  // } catch (error) {
  //   res.json({ isError: true, message: "internal server error" });
  // }
};

const FetchAllOrders = (req, res) => {
  // try {
  //   const sql = `
  //   SELECT
  //     orders.*,
  //     products.images,
  //     products.name,
  //     users.firstname
  //   FROM
  //     orders
  //   JOIN
  //     products
  //   ON orders.product_id = products.id
  //   JOIN users ON orders.user_id = users.id
  //   ORDER BY
  //     orders.id DESC`;
  //   connection.query(sql, (error, orders) => {
  //     if (error) {
  //       return res.json({
  //         isError: true,
  //         message: "Something went wrong. Please try again.",
  //       });
  //     }
  //     res.json({ isError: false, payload: parseProductImages(orders) });
  //   });
  // } catch (error) {
  //   res.json({ isError: true, message: "internal server error" });
  // }
};

const FetchAllOrderByUserId = (req, res) => {
  // try {
  //   const sql = `
  //   SELECT
  //     orders.*,
  //     products.images,
  //     products.name,
  //     users.firstname
  //   FROM
  //     orders
  //   JOIN
  //     products
  //   ON
  //     orders.product_id = products.id
  //   JOIN users ON
  //     orders.user_id = users.id
  //   WHERE
  //     orders.user_id =?
  //   ORDER BY
  //     orders.id DESC`;
  //   connection.query(sql, [req.user.id], (error, orders) => {
  //     if (error) {
  //       return res.json({
  //         isError: true,
  //         message: "Something went wrong. Please try again.",
  //       });
  //     }
  //     res.json({ isError: false, payload: parseProductImages(orders) });
  //   });
  // } catch (error) {
  //   res.json({ isError: true, message: "internal server error" });
  // }
};

const FetchCustomerAndOrderDetails = (req, res) => {
  // try {
  //   const sql = `SELECT * FROM orders, users, address WHERE orders.id =?
  //   AND users.id = orders.user_id AND address.id = orders.shipping_address_id`;
  //   connection.query(sql, [req.params.orderId], (error, result) => {
  //     if (error) {
  //       return res.json({
  //         isError: true,
  //         message: "Something went wrong. Please try again.",
  //       });
  //     }
  //     res.json({ isError: false, payload: result[0] });
  //   });
  // } catch (error) {
  //   res.json({ isError: true, message: "internal server error" });
  // }
};

const FetchOrdersAndProduct = (req, res) => {
  // try {
  //   const sql = `SELECT * FROM orders, products WHERE orders.user_id =?
  //   AND orders.transaction_reference = ? AND products.id = orders.product_id`;
  //   connection.query(
  //     sql,
  //     [req.body.userId, req.body.orderId],
  //     (error, result) => {
  //       if (error) {
  //         return res.json({
  //           isError: true,
  //           message: "Something went wrong. Please try again.",
  //         });
  //       }
  //       res.json({ isError: false, payload: parseProductImages(result) });
  //     }
  //   );
  // } catch (error) {
  //   res.json({ isError: true, message: "internal server error" });
  // }
};

const DeleteOrder = (req, res) => {
  try {
    connection.query(
      "DELETE FROM orders WHERE id = ?",
      [req.params.id],
      (error, response) => {
        if (error) {
          return res.json({
            isError: true,
            message: "Something went wrong. Please try again.",
          });
        }
        if (response.affectedRows > 0) {
          res.json({
            isError: false,
            message: "Record deleted successfully",
          });
        }
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

module.exports = {
  AcceptPayment,
  ConfirmPayment,
  FetchUncompletedOrderByuserId,
  FetchAllOrders,
  FetchAllOrderByUserId,
  FetchCustomerAndOrderDetails,
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
