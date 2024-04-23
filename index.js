const express = require("express");
const PORT = 3000;
const session = require("express-session");
const cors = require("cors");
const UUID = require("uuid");
const bodyParser = require("body-parser");
// ROUTES
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products");

// MIDDLE WARES
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const expDate = 60 * 60 * 1000 * 24; // 1 hour 1 day
app.use(
  session({
    name: "online_store",
    secret: UUID.v4(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: expDate,
      secure: process.env.NODE_ENV || "production",
      // sameSite: "strict", // 'strict'
      sameSite: true, // 'strict'
    },
  })
);

// ENDPOINTS
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
