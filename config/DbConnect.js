require("dotenv").config();
const mysql = require("mysql");

// const dbConfig = {
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "online_store",
// };

const dbConfig = {
  host: process.env.HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Database connected successfully");
});

module.exports = connection;
