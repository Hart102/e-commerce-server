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

router.get("/getUncompleted-payment", GetUncompletedOrderByuserId); //Done
router.post("/accept-payment", AcceptPayment); //Done
router.get("/confirm-payment", confirmPayment); //Done

router.get("/fetch-all-orders", FetchAllOrders); //Done
router.delete("/delete-order/:id", DeleteOrder); //Done
router.get(
  "/fetch-customer-and-orderDetails/:orderId",
  FetChCustomerAndOrderDeatils
);
router.post("/fetch-order-and-products", FetchOrdersAndProduct);//Done

module.exports = router;
