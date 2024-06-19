const express = require("express");
const router = express.Router();
const {
  GetUncompletedOrderByuserId,
  AcceptPayment,
  confirmPayment,
} = require("../../controllers/payment/index");

router.get("/getUncompleted-payment", GetUncompletedOrderByuserId);
router.post("/accept-payment", AcceptPayment);
router.get("/confirm-payment", confirmPayment);

module.exports = router;
