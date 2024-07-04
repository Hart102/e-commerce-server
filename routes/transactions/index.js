const express = require("express");
const router = express.Router();
const {
  FetchUncompletedOrderByuserId,
  AcceptPayment,
  ConfirmPayment,
  FetchAllOrders,
  FetchAllOrderByUserId,
  FetchCustomerAndOrderDetails,
  FetchOrdersAndProduct,
  DeleteOrder,
} = require("../../controllers/transactions/index");
const authMiddleware = require("../../auth/authMiddleware");

router.get(
  "/getUncompleted-payment",
  authMiddleware,
  FetchUncompletedOrderByuserId
); //Done
router.post("/accept-payment", authMiddleware, AcceptPayment); //Done
router.get("/confirm-payment", authMiddleware, ConfirmPayment); //Done

router.get("/fetch-all-orders", authMiddleware, FetchAllOrders); //Done
router.get("/fetch-order-by-userId", authMiddleware, FetchAllOrderByUserId); //Done

router.delete("/delete-order/:id", authMiddleware, DeleteOrder); //Done
router.get(
  "/fetch-customer-and-orderDetails/:orderId",
  authMiddleware,
  FetchCustomerAndOrderDetails
);
router.post("/fetch-order-and-products", authMiddleware, FetchOrdersAndProduct);//Done

module.exports = router;
