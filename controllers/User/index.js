require("dotenv").config();
const connection = require("../../config/DbConnect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const {
  UserRegisterationationSchema,
  UserLoginSchema,
  EditProfileSchema,
  ResetPasswordSchema,
  AddressSchema,
} = require("../../schema/index");

const UserRegisteration = (req, res) => {
  const { error, value } = UserRegisterationationSchema.validate(req.body);

  if (error) {
    return res.json({ isError: true, message: error.details[0].message });
  }
  connection.query(
    "SELECT COUNT(*) AS count FROM users WHERE email = ?",
    [value.email],
    (err, result) => {
      if (err) {
        return res.json({
          isError: true,
          message: "Something went wrong please try again.",
        });
      }
      const emailExists = result[0].count > 0;
      if (emailExists) {
        return res.json({ isError: true, message: "Email already exists" });
      }
      const hashedPassword = bcrypt.hashSync(value.password, saltRounds);
      connection.query(
        "INSERT INTO users (firstname, lastname, email, password, user_role) VALUES (?, ?, ?, ?, ?)",
        [
          value.firstname.toLowerCase(),
          value.lastname.toLowerCase(),
          value.email.toLowerCase(),
          hashedPassword,
          "customer",
        ],
        (err) => {
          if (err) {
            return res.json({
              isError: true,
              message: "Something went wrong please try again.",
            });
          }
          res.json({
            isError: false,
            message: "UserRegisterationation successfull",
          });
        }
      );
    }
  );
};

const UserLogin = (req, res) => {
  try {
    const { error, value } = UserLoginSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    connection.query(
      "SELECT id, email, password, user_role FROM users WHERE email = ?",
      [value.email],
      (err, result) => {
        if (err) {
          return res.json({ isError: true, message: "Internal server error" });
        }
        if (result.length === 0) {
          return res.json({
            isError: true,
            message: "User not found",
          });
        }
        const { id, email, password, user_role } = result[0];
        const match = bcrypt.compareSync(value.password, password);
        if (match) {
          const payload = jwt.sign(
            { id, email },
            process.env.Authentication_Token,
            { expiresIn: "24h" }
          );
          res.json({
            isError: false,
            message: "UserLogin successful",
            payload,
            user_role,
          });
        } else {
          res.json({ isError: true, message: "Incorrect email or password" });
        }
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "Internal server error" });
  }
};

const EditProfile = (req, res) => {
  try {
    const { error, value } = EditProfileSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { firstname, lastname, email } = value;

    // Check if the email already exists
    const checkEmailSql = "SELECT id FROM users WHERE email = ? AND id != ?";
    connection.query(
      checkEmailSql,
      [email.toLowerCase(), req.user.id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.json({
            isError: true,
            message: "Something went wrong, please try again.",
          });
        }

        if (result.length > 0) {
          // Email already exists for another user
          return res.json({
            isError: true,
            message: "Email already in use",
          });
        }

        // Proceed with the update
        const updateSql =
          "UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?";
        connection.query(
          updateSql,
          [
            firstname.toLowerCase(),
            lastname.toLowerCase(),
            email.toLowerCase(),
            req.user.id,
          ],
          (updateError, response) => {
            if (updateError) {
              console.log(updateError);
              return res.json({
                isError: true,
                message: "Something went wrong, please try again.",
              });
            }

            if (response.affectedRows > 0) {
              res.json({ isError: false, message: "Update successful" });
            } else {
              res.json({
                isError: true,
                message: "User not found  no changes made.",
              });
            }
          }
        );
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "Internal server error" });
  }
};

const ResetPassword = (req, res) => {
  try {
    const { error, value } = ResetPasswordSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { oldPassword, newPassword } = value;
    connection.query(
      "UPDATE users SET password =? WHERE id =? AND password =?",
      [newPassword, req.user.id, oldPassword],
      (error, response) => {
        if (error) {
          return res.json({
            isError: true,
            message: "something went wrong, please try again.",
          });
        }
        if (response.affectedRows > 0) {
          res.json({ isError: false, message: "Password updated" });
        } else {
          res.json({
            isError: true,
            message: "Previous password is incorrect",
          });
        }
      }
    );
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

const FetchUserRole = (req, res) => {
  try {
    const sql = "SELECT user_role FROM users WHERE id =?";
    connection.query(sql, [req.user.id], (err, user) => {
      if (err) {
        return res.json({
          isError: true,
          message: "something went wrong, please try again.",
        });
      }
      res.json({ isError: false, payload: user });
    });
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

// "SELECT * FROM users, address WHERE users.id =? AND address.user_id = users.id",
const FetchUserRoleAndUserAddress = (req, res) => {
  try {
    const sql = `
      SELECT users.*, address.* 
      FROM users 
      LEFT JOIN address ON users.id = address.user_id 
      WHERE users.id = ?
    `;
    connection.query(sql, [req.user.id], (err, user) => {
      if (err) {
        return res.json({
          isError: true,
          message: "something went wrong, please try again.",
        });
      }
      res.json({ isError: false, payload: user });
    });
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
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

const DeleteAddress = (req, res) => {
  try {
    if (req.params.id) {
      connection.query(
        "DELETE FROM address WHERE id = ?",
        [req.params.id],
        (error, response) => {
          if (error) {
            return res.json({
              isError: true,
              message: "Something went wrong, please try again.",
            });
          }
          if (response.affectedRows > 0) {
            res.json({ isError: true, message: "Deleted" });
          }
        }
      );
    }
  } catch (error) {
    res.json({ isError: true, message: "internal server error" });
  }
};

const LogOut = (req, res) => {
  res.clearCookie(process.env.Authentication_Token);
  res.json({ isError: false, message: "Logged out successfully" });
};

module.exports = {
  UserRegisteration,
  UserLogin,
  FetchUserRole,
  FetchUserRoleAndUserAddress,
  EditProfile,
  ResetPassword,
  CreateAddress,
  DeleteAddress,
  LogOut,
};
