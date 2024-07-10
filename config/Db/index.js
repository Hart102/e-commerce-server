const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.rv70ch9.mongodb.net/online_store?retryWrites=true&w=majority`;
const client = new MongoClient(url);
client
  .connect()
  .then(() => {
    console.log("Connected to Mongodb!");
  })
  .catch((error) => console.log("Failed to connect!", error));

const dbName = client.db("online_store");
const usersCollection = dbName.collection("admin");

const DbConnection = { usersCollection };

module.exports = DbConnection;

// require("dotenv").config();
// const { MongoClient } = require("mongodb");

// const DbConnection = async () => {
//   try {
//     const url = `mongodb+srv://${process.env.Database_username}:${process.env.Database_password}@cluster0.rv70ch9.mongodb.net/online_store?retryWrites=true&w=majority`;

//     const client = new MongoClient(url, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       tls: true,
//       tlsAllowInvalidCertificates: false,
//     });
//     await client.connect();

//     const dbName = "online_store";
//     const users_collection = "users";

//     const database = client.db(dbName);
//     const usersCollection = database.collection(users_collection);

//     console.log("Connected to MongoDB");
//     return { usersCollection };
//   } catch (error) {
//     console.error("Database connection failed:", error);
//     throw error;
//   }
// };

// module.exports = DbConnection;
