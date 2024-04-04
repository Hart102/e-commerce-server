const express = require("express");
const PORT = 3000;
const session = require("express-session");
const UUID = require("uuid");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "online_store",
    secret: UUID.v4(),
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
