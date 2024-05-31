const express = require("express");
const PORT = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
// ROUTES
const userRoutes = require("./routes/User/index");
const productRoutes = require("./routes/Product/index");
const cart = require("./routes/Cart/index");
const checkout = require("./routes/Checkout/index");

// MIDDLE WARES
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ENDPOINTS
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cart);
app.use("/api/checkout", checkout);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
