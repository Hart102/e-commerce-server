require("dotenv").config();
const connection = require("../../config/DbConnect");
const DbConnection = require("../../config/Db");
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

const UserRegisteration = async (req, res) => {
  try {
    const { error, value } = UserRegisterationationSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { firstname, lastname, email, password } = value;
    const { usersCollection } = DbConnection;

    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      console.log(existingUser);
      return res.json({ isError: true, message: "Email already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const payload = {
      firstname: firstname.toLowerCase(),
      lastname: lastname.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      user_role: "customer",
      address: [],
    };
    const insert = await usersCollection.insertOne(payload);
    if (!insert.acknowledged) {
      res.json({
        isError: true,
        message: "Failed to register user. Please try again.",
      });
    } else {
      res.json({ isError: false, message: "Registeraion successful." });
    }
  } catch (error) {
    res.json({ isError: true, message: "An error occured please try again." });
  }
};

const UserLogin = async (req, res) => {
  try {
    const { error, value } = UserLoginSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { usersCollection } = await DbConnection;
    const result = await usersCollection.findOne({
      email: value.email.toLowerCase(),
    });

    if (result == null) {
      return res.json({ isError: true, message: "User not found" });
    }
    const { _id, email, password, user_role } = result;
    const match = bcrypt.compareSync(value.password, password);

    if (match) {
      const payload = jwt.sign(
        { _id, email },
        process.env.Authentication_Token,
        { expiresIn: "24h" }
      );
      res.json({
        isError: false,
        message: "Login success",
        payload,
        user_role,
      });
    } else {
      res.json({ isError: true, message: "Incorrect email or password" });
    }
  } catch (error) {
    res.json({ isError: true, message: "An error occured please try again." });
  }
};

const EditProfile = async (req, res) => {
  try {
    const { error, value } = EditProfileSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { usersCollection } = await DbConnection;
    const { firstname, lastname, email } = value;
    const userId = req.user._id;

    // Check if the email already exists for another user
    const existingEmail = await usersCollection.findOne({
      email: email.toLowerCase(),
      _id: { $ne: new ObjectId(userId) },
    });

    if (existingEmail) {
      return res.json({
        isError: true,
        message: "Email already in use",
      });
    }

    // Proceed with the update
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstname: firstname.toLowerCase(),
          lastname: lastname.toLowerCase(),
          email: email.toLowerCase(),
        },
      }
    );

    if (updateResult.modifiedCount > 0) {
      res.json({ isError: false, message: "Update successful" });
    } else {
      res.json({
        isError: true,
        message: "User not found or no changes made.",
      });
    }
  } catch (error) {
    console.error("Profile update failed:", error);
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
const FetchUserRoleAndUserAddress = async (req, res) => {
  try {
    const { usersCollection } = await DbConnection;
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      _id: { $ne: new ObjectId(req.user._id) },
    });

    // const sql = `
    //   SELECT users.*, address.*
    //   FROM users
    //   LEFT JOIN address ON users.id = address.user_id
    //   WHERE users.id = ?
    // `;
    // connection.query(sql, [req.user.id], (err, user) => {
    //   if (err) {
    //     return res.json({
    //       isError: true,
    //       message: "something went wrong, please try again.",
    //     });
    //   }
    //   res.json({ isError: false, payload: user });
    // });
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
