require("dotenv").config();
const jwt = require("jsonwebtoken");
const connection = require("../../config/DbConnect");
const { categorySchema } = require("../../schema/index");

const CreateCategory = (req, res) => {
  try {
    console.log(req.body);
    const token = req.header("Authorization");
    jwt.verify(token, process.env.Authentication_Token, (err) => {
      if (err) {
        return res.json({ error: "invalid authentication token!" });
      }
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.json({ error: error.details[0].message });
      }

      console.log(value);
    });
  } catch (error) {
    console.log(error.message);
    res.json("internal server error");
  }
};

module.exports = {
  CreateCategory,
};
