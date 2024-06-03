const express = require("express");
const router = express.Router();
const {
  addPaymentCard,
  getPaymentCard,
  AcceptPayment,
} = require("../../controllers/Checkout/index");

router.put("/add-payment-card", addPaymentCard);
router.get("/get-payment-card", getPaymentCard);
router.post("/accept-payment", AcceptPayment);


module.exports = router;
