const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Address schema
const addressSchema = new Schema({
  address_line: String,
  city: String,
  state: String,
  country: String,
  zipcode: String,
  phone: String,
});

// User schema
const userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  user_role: String,
  addresses: [addressSchema], // Embed address schema as a subdocument
});

const Users = mongoose.model("Users", userSchema);
const collections = { Users };

module.exports = collections;
