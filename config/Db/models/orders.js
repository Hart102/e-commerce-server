const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  shipping_address_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Address",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  demanded_quantity: {
    type: Number,
    required: true,
  },
  total_price: {
    type: String,
    required: true,
  },
  transaction_reference: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
