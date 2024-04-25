const connection = require("../DbConnect");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { registerationSchema, loginSchema } = require("../schema/index");

const register = (req, res) => {
  const { error, value } = registerationSchema.validate(req.body);
  if (error) {
    return res.json({ error: error.details[0].message });
  }

  connection.query(
    "SELECT COUNT(*) AS count FROM users WHERE email = ?",
    [value.email],
    (err, result) => {
      if (err) {
        return res.json({ error: "something went wrong please try again." });
      }

      const emailExists = result[0].count > 0;
      if (emailExists) {
        return res.json({ error: "email already exists" });
      }
      connection.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
        [value.firstname, value.lastname, value.email, value.password],
        (err, result) => {
          if (err) {
            return res.json({
              error: "something went wrong please try again.",
            });
          }
          res.json({
            message: "user registered successfully",
            userId: result.insertId,
          });
        }
      );
    }
  );
};

const login = (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }

    connection.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [value.email, value.password],
      (err, result) => {
        if (err) {
          return res.json({ error: "Internal server error" });
        }
        if (result.length === 0) {
          return res.json({ error: "User not found" });
        }
        const token = jwt.sign(
          { id: result[0].id, email: result[0].email },
          "tokenabc",
          { expiresIn: "24h" }
        );
        res.json({ message: "Login successful", token });
      }
    );
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
};

const getUserById = (req, res) => {};

const getAllUsers = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};




module.exports = { register, login };
