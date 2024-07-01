require("dotenv").config();
const connection = require("../../config/DbConnect");
const jwt = require("jsonwebtoken");
const {
  registerationSchema,
  loginSchema,
  EditProfileSchema,
  ResetPasswordSchema,
  AddressSchema,
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
          return res.json({ error: "Incorrect email or password" });
        }
        const token = jwt.sign(
          { id: result[0].id, email: result[0].email },
          process.env.Authentication_Token,
          { expiresIn: "24h" }
        );
        res.json({ message: "Login successful", token });
      }
    );
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
};

const CreateAddress = (req, res) => {
  try {
    const { error, value } = AddressSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    // Return warning message if user has two addresses
    let sql = "SELECT COUNT(*) AS total_items FROM address WHERE user_id = ?";
    connection.query(sql, [req.user.id], (err, result) => {
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
          req.user.id,
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
  } catch (error) {
    res.json({ error: "Internal server error" });
  }
};

const FetchUserAddress = (req, res) => {
  try {
    connection.query(
      "SELECT * FROM address WHERE user_id = ? ORDER BY id DESC",
      [req.user.id],
      (err, address) => {
        if (err) {
          return res.json({
            error: "something went wrong, please try again.",
          });
        }
        res.json(address);
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const EditProfile = (req, res) => {
  try {
    const { error, value } = EditProfileSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    const { firstname, lastname, email } = value;
    connection.query(
      "UPDATE users SET firstname =?, lastname =?, email =? WHERE id =?",
      [
        firstname.toLowerCase(),
        lastname.toLowerCase(),
        email.toLowerCase(),
        req.user.id,
      ],
      (error, response) => {
        if (error) {
          return res.json({ error: "Something went wrong, please try again." });
        }
        if (response.affectedRows > 0) {
          res.json({ message: "Update successful" });
        }
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const ResetPassword = (req, res) => {
  try {
    const { error, value } = ResetPasswordSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    const { oldPassword, newPassword } = value;
    connection.query(
      "UPDATE users SET password =? WHERE id =? AND password =?",
      [newPassword, req.user.id, oldPassword],
      (error, response) => {
        if (error) {
          return res.json({ error: "something went wrong, please try again." });
        }
        if (response.affectedRows > 0) {
          res.json({ message: "Password updated" });
        } else {
          res.json({ error: "Incorrect previous password" });
        }
      }
    );
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const DeleteAddress = (req, res) => {
  try {
    if (req.params.id) {
      connection.query(
        "DELETE FROM address WHERE id = ?",
        [req.params.id],
        (error, response) => {
          if (error) {
            return res.json({
              error: "Something went wrong, please try again.",
            });
          }
          if (response.affectedRows > 0) {
            res.json({ message: "Deleted" });
          }
        }
      );
    }
  } catch (error) {
    res.json({ error: "internal server error" });
  }
};

const getUserById = (req, res) => {};

const getAllUsers = (req, res) => {};

const deleteUser = (req, res) => {};

module.exports = {
  register,
  login,
  CreateAddress,
  FetchUserAddress,
  EditProfile,
  ResetPassword,
  DeleteAddress,
};
