const jwt = require("jsonwebtoken");
const connection = require("../../DbConnect");
const { paymentCardSchema } = require("../../schema/index");

const addPaymentCard = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (err, user) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      const { error, value } = paymentCardSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
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
  } catch (error) {
    res.json({ error: "Internal server error!" });
  }
};

const getPaymentCard = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (err, user) => {
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

module.exports = { addPaymentCard, getPaymentCard };
