require("dotenv").config();
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const Users = require("../../config/Db/models/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const {
  EditProfileSchema,
  ResetPasswordSchema,
  AddressSchema,
} = require("../../schema/index");
const { errorResponse } = require("../../lib/index");

const UserRegisteration = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const existing_user = await Users.findOne({
      email: email.toLowerCase(),
    });
    if (existing_user) {
      return res.json({ isError: true, message: "Email already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const payload = {
      firstname: firstname.toLowerCase(),
      lastname: lastname.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      user_role: "customer",
    };
    const user = new Users(payload);
    const saved = await user.save();

    if (saved.createdAt) {
      delete saved.password;
      res.json({
        isError: false,
        message: "Registeration successful",
        payload: saved,
      });
    } else {
      res.json({
        isError: true,
        message: "Something went wrong, please try again.",
      });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const UserLogin = async (req, res) => {
  try {
    const result = await Users.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (result == null) {
      return res.json({ isError: true, message: "User not found" });
    }
    const match = bcrypt.compareSync(req.body.password, result.password);
    if (match) {
      const payload = jwt.sign(
        { _id: result._id, email: result.email },
        process.env.Authentication_Token,
        { expiresIn: "24h" }
      );
      res.json({
        isError: false,
        message: "Login success",
        payload,
        user_role: result.user_role,
      });
    } else {
      res.json({ isError: true, message: "Incorrect email or password" });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const EditProfile = async (req, res) => {
  try {
    const { error, value } = EditProfileSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const userId = req.user._id;

    const existing_email = await Users.findOne({
      email: value.email.toLowerCase(),
      _id: { $ne: new ObjectId(userId) },
    });
    if (existing_email) {
      return res.json({
        isError: true,
        message: "Email already in use",
      });
    }
    const updateResult = await Users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstname: value.firstname.toLowerCase(),
          lastname: value.lastname.toLowerCase(),
          email: value.email.toLowerCase(),
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
    errorResponse(error, res);
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { error, value } = ResetPasswordSchema.validate(req.body);
    if (error) {
      return res.json({ isError: true, message: error.details[0].message });
    }
    const { oldPassword, newPassword } = value;

    const user = await Users.findOne({ _id: new ObjectId(req.user._id) });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.json({ isError: true, message: "Previous password is incorrect" });
      return;
    }
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    const password_update = await Users.updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { password: hashedPassword } }
    );
    if (password_update.modifiedCount > 0) {
      res.json({ isError: false, message: "Password updated" });
    } else {
      res.json({ isError: true, message: "User not found" });
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const FetchUser = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: new ObjectId(req.user._id) });
    if (!user) {
      res.json({ isError: true, message: "User not found" });
      return;
    }
    delete user.password;
    res.json({ isError: false, payload: user });
  } catch (error) {
    errorResponse(error, res);
  }
};

const FetchUserRole = async (req, res) => {
  try {
    const user_role = await Users.findOne(
      { _id: new ObjectId(req.user._id) },
      { user_role: 1, _id: 1 }
    );
    if (user_role == null) {
      res.json({ isError: false, payload: {} });
      return;
    }
    res.json({ isError: false, payload: user_role.user_role });
  } catch (error) {
    errorResponse(error, res);
  }
};

const CreateAddress = async (req, res) => {
  try {
    const { error, value } = AddressSchema.validate(req.body);
    if (error) {
      return res.json({ error: error.details[0].message });
    }
    const user = await Users.findOne(
      { _id: new ObjectId(req.user._id) },
      { addresses: 1 }
    );
    if (user.addresses.length > 2) {
      res.json({
        isError: true,
        message: "User cannot have more than two addresses",
      });
    } else {
      user.addresses.push({ ...value, _id: user?.addresses?.length });
      const save = await Users.updateOne(
        { _id: new ObjectId(req.user._id) },
        { $set: { addresses: user.addresses } }
      );
      if (save.modifiedCount > 0) {
        res.json({
          isError: false,
          message: "Address successfully added",
        });
      }
    }
  } catch (error) {
    errorResponse(error, res);
  }
};

const DeleteAddress = async (req, res) => {
  try {
    if (req.params.id) {
      const user = await Users.findOneAndUpdate(
        { _id: new ObjectId(req.user._id) },
        { $pull: { addresses: { _id: new ObjectId(req.params.id) } } },
        { new: true }
      );
      const filtered_addresses = user.addresses.filter(
        (address) => address._id !== req.params._id
      );
      const saved = await Users.updateOne(
        { _id: new ObjectId(req.user._id) },
        { $set: { addresses: filtered_addresses } }
      );
      if (saved.modifiedCount > 0) {
        res.json({ isError: false, message: "Deleted" });
      } else {
        res.json({ isError: true, message: "Address not found" });
      }
    }
  } catch (error) {
    errorResponse(error, res);
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
  FetchUser,
  EditProfile,
  ResetPassword,
  CreateAddress,
  DeleteAddress,
  LogOut,
};
