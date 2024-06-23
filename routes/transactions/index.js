const express = require("express");
const router = express.Router();
const {
  GetUncompletedOrderByuserId,
  AcceptPayment,
  confirmPayment,
  FetchAllOrders,
  FetchCustomerAndOrderDetails,
  DeleteOrder,
} = require("../../controllers/transactions/index");

router.get("/getUncompleted-payment", GetUncompletedOrderByuserId);
router.post("/accept-payment", AcceptPayment);
router.get("/confirm-payment", confirmPayment);
router.get(
  "/fetch-customers-and-orderDetails/:orderId",
  FetchCustomerAndOrderDetails
);
router.get("/fetch-all-orders", FetchAllOrders);
router.delete("/delete-order/:id", DeleteOrder);

module.exports = router;
