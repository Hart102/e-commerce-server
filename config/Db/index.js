const { MongoClient } = require("mongodb");
require("dotenv").config();

// const url = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.rv70ch9.mongodb.net/online_store?retryWrites=true&w=majority`;
// const client = new MongoClient(url);
// client
//   .connect()
//   .then(() => {
//     console.log("Connected to Mongodb!");
//   })
//   .catch((error) => console.log("Failed to connect!", error));

// const dbName = client.db("online_store");
// const users = dbName.collection("admin");

// const DbConnection = { users };

// module.exports = DbConnection;

const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.rv70ch9.mongodb.net/online_store?retryWrites=true&w=majority`;

// mongoose
//   .connect(mongoURI)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

const DbConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to Mongodb database");
  } catch (error) {
    console.log("Failed to connect to Mongodb:", error);
  }
  // mongoose
  //   .connect(mongoURI)
  //   .then(() => console.log("MongoDB Connected"))
  //   .catch((err) => {
  //     console.log("MongoDB connection error:", err);
  //     setTimeout(connectWithRetry, 5000);
  //   });
};
module.exports = DbConnection;
