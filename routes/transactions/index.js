const express = require("express");
const router = express.Router();
const {
  GetUncompletedOrderByuserId,
  AcceptPayment,
  confirmPayment,
  FetchAllOrders,
  FetChCustomerAndOrderDeatils,
  FetchOrdersAndProduct,
  DeleteOrder,
} = require("../../controllers/transactions/index");
const authMiddleware = require("../../auth/authMiddleware");


router.get("/getUncompleted-payment", authMiddleware, GetUncompletedOrderByuserId); //Done
router.post("/accept-payment", authMiddleware, AcceptPayment); //Done
router.get("/confirm-payment", authMiddleware, confirmPayment); //Done

router.get("/fetch-all-orders", authMiddleware, FetchAllOrders); //Done
router.delete("/delete-order/:id", authMiddleware, DeleteOrder); //Done
router.get(
  "/fetch-customer-and-orderDetails/:orderId",
  authMiddleware,
  FetChCustomerAndOrderDeatils
);
router.post("/fetch-order-and-products", authMiddleware, FetchOrdersAndProduct);//Done

module.exports = router;
