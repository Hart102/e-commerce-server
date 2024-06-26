require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.Authentication_Token);
    req.user = decoded;
    next();
  } catch (err) {
    res.json({ error: "Invalid authentication token!" });
  }
};

module.exports = authMiddleware;
