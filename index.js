const express = require("express");
const PORT = 3000;
const session = require("express-session");
const cors = require("cors");
const UUID = require("uuid");
// ROUTES
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products");

// MIDDLE WARES
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "online_store",
    secret: UUID.v4(),
    resave: false,
    saveUninitialized: false,
  })
);

// ENDPOINTS
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
