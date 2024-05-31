const express = require("express");
const router = express.Router();
const {
  addPaymentCard,
  getPaymentCard,
} = require("../../controllers/Checkout/index");

router.put("/add-payment-card", addPaymentCard);
router.get("/get-payment-card", getPaymentCard);

module.exports = router;
