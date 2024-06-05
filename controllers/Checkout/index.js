require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../../config/DbConnect");
const { paymentCardSchema, OrderSchema } = require("../../schema/index");
const {
  initializePayment,
  verifyPayment,
} = require("../../config/acceptPayment");

const addPaymentCard = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, (err, user) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      const { error, value } = paymentCardSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      let sql =
        "SELECT COUNT(*) AS total_address FROM payment_cards WHERE user_id = ?";

      connection.query(sql, [user.id], (err, counts) => {
        if (err) {
          return res.json({
            error: "Something went wrong, please try again.",
          });
        }
        if (counts[0].total_address > 1) {
          return res.json({
            error: "User cannot have more than two payment cards",
          });
        }
        connection.query(
          "INSERT INTO payment_cards SET?",
          {
            user_id: user.id,
            card_number: value.card_number,
            card_name: value.card_name,
            expiry_date: value.expiry_date,
            cvv: value.cvv,
          },
          (error, results) => {
            if (error) {
              return res.json({
                error: "Something went wrong. Please try again.",
              });
            }
            res.json({
              message: "Payment card added successfully",
              paymentCardId: results.insertId,
            });
          }
        );
      });
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const getPaymentCard = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, (err, user) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      connection.query(
        "SELECT * FROM payment_cards WHERE user_id = ?",
        [user.id],
        (error, cards) => {
          if (error) {
            return res.json({
              error: "Something went wrong. Please try again.",
            });
          }
          res.json({ cards });
        }
      );
    });
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const AcceptPayment = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, async (err, user) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      const { error, value } = OrderSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      const amountInKobo = parseFloat(value.totalPrice);
      const response = await initializePayment({
        email: user.email,
        amount: amountInKobo,
      });
      if (response.error) {
        return res.json({ error: response.error });
      }
      if (response.data.status === true) {
        value.productsId.map((id) => {
          connection.query(
            "INSERT INTO orders SET?",
            {
              user_id: user?.id,
              shipping_address_id: value?.addressId,
              product_id: id,
              total_price: `NGN ${value?.totalPrice}`,
              transaction_reference: response.data.data.reference,
            },
            (error) => {
              if (error) {
                return res.json({
                  error: "Something went wrong. Please try again.",
                });
              }
              user = {
                ...user,
                transaction_reference: response.data.data.reference,
              };
              res.json({
                payment_url: response.data.data.authorization_url,
              });
            }
          );
        });
      }
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

module.exports = { addPaymentCard, getPaymentCard, AcceptPayment };
