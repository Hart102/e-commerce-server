const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    demanded_quantity: { type: Number, required: true },
  },
  { timestamps: true }
);
const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
