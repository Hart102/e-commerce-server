const express = require("express");
const PORT = 3000;
const cors = require("cors");
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


// ENDPOINTS
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
