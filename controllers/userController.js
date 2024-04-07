const connection = require("../DbConnect");

const checkEmptyKeys = (object, keys) => {
  for (let key of keys) {
    if (!object[key] || object[key] === "") {
      return true;
    }
  }
  return false;
};

const register = (req, res) => {
  const requiredKeys = [
    "firstname",
    "lastname",
    "email",
    // "phone",
    // "address",
    "password",
  ];

  if (checkEmptyKeys(req.body, requiredKeys)) {
    return res.json({ error: "All fields are required" });
  }

  connection.query(
    "SELECT COUNT(*) AS count FROM users WHERE email = ?",
    [req.body.email],
    (err, result) => {
      if (err) {
        return res.json({ error: "Internal server error" });
      }

      const emailExists = result[0].count > 0;
      if (emailExists) {
        return res.json({ error: "Email already exists" });
      }

      connection.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
        [
          req.body.firstname,
          req.body.lastname,
          req.body.email,
          req.body.password,
        ],
        (err, result) => {
          if (err) {
            return res.json({ error: "Internal server error" });
          }

          res.json({
            message: "User registered successfully",
            userId: result.insertId,
          });
        }
      );
    }
  );
};

const login = (req, res) => {
  try {
    if (checkEmptyKeys(req.body, ["email", "password"])) {
      return res.json({ error: "All fields are required" });
    }

    const { email, password } = req.body;

    connection.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      (err, result) => {
        if (err) {
          return res.json({ error: "Internal server error" });
        }

        if (result.length === 0) {
          return res.json({ error: "User not found" });
        }

        delete result[0].password;
        req.session.user = result[0];
        res.json({ message: "Login successful", user: result[0] });
      }
    );
  } catch (error) {
    console.log(error.message);
    res.json({ error: "Internal server error" });
  }
};

const getUserById = (req, res) => {};

const getAllUsers = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

module.exports = { register, login };
