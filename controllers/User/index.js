const connection = require("../../DbConnect");
const jwt = require("jsonwebtoken");
const {
  registerationSchema,
  loginSchema,
  locationSchema,
} = require("../../schema/index");

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

const addLocation = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (err, user) => {
      if (err) {
        return res.json({ error: "Invalid authentication token!" });
      }
      const { error, value } = locationSchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }
      // Return warning message if user has two addresses
      let sql = "SELECT COUNT(*) AS total_items FROM address WHERE user_id = ?";
      connection.query(sql, [user.id], (err, result) => {
        if (err) {
          return res.json({
            warning: "Something went wrong, please try again.",
          });
        }
        if (result[0].total_items == 2) {
          return res.json({
            error: "User cannot have more than two addresses",
          });
        }
        sql =
          "INSERT INTO address (user_id, address_line, city, state, country, zip_code, phone_number) VALUES (?,?,?,?,?,?,?)";
        connection.query(
          sql,
          [
            user.id,
            value.address,
            value.city,
            value.state,
            value.country,
            value.zipcode,
            value.phone,
          ],
          (error, result) => {
            if (error) {
              return res.json({
                error: "Something went wrong, please try again.",
              });
            }
            if (result.affectedRows > 0) {
              res.json({ message: "Address successfully added" });
            }
          }
        );
      });
    });
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
};

const getUserAddress = (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, "tokenabc", (error, user) => {
      if (error) {
        return res.json({ error: "invalid authentication token!" });
      }
      connection.query(
        "SELECT * FROM address WHERE user_id = ?",
        [user.id],
        (err, address) => {
          if (err) {
            return res.json({
              error: "something went wrong, please try again.",
            });
          }
          res.json(address);
        }
      );
    });
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const getUserById = (req, res) => {};

const getAllUsers = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

module.exports = { register, login, addLocation, getUserAddress };
