const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "out of stock"],
      default: "available",
    },
    images: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Products = mongoose.model("products", productSchema);
module.exports = Products;
