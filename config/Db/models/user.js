const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  address_line: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true, minlength: 10, maxlength: 15 },
});

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 6 },
    user_role: {
      type: String,
      required: true,
      enum: ["customer", "admin", "seller"],
      default: "customer",
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("users", userSchema);

module.exports = Users;
