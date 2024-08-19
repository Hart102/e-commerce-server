require("dotenv").config();

const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.rv70ch9.mongodb.net/online_store?retryWrites=true&w=majority`;

const DbConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to Mongodb database");
  } catch (error) {
    console.log("Failed to connect to Mongodb:", error);
  }
};
module.exports = DbConnection;
