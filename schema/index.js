const Joi = require("joi");


const EditProfileSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
});

const ResetPasswordSchema = Joi.object().keys({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(4).required(),
});

const AddressSchema = Joi.object().keys({
  address_line: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  zipcode: Joi.string().required(),
  phone: Joi.string().required(),
});
//------------------------------------------------

const createProductSchema = Joi.object().keys({
  name: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.number().required(),
  status: Joi.string().required(),
  replacedImageIds: Joi.string(),
  images: Joi.string(),
  id: Joi.string(),
  file: Joi.string(),
});

const paymentCardSchema = Joi.object().keys({
  card_number: Joi.string().max(15).required(),
  card_name: Joi.string().required(),
  expiry_date: Joi.string().required(),
  cvv: Joi.string().min(3).max(3).required(),
});

const OrderSchema = Joi.object().keys({
  addressId: Joi.number().required().messages({
    "any.required": "Please provide a shipping address",
  }),
  products: Joi.array().required(),
  totalPrice: Joi.number().required(),
});

const categorySchema = Joi.object().keys({
  name: Joi.string().required(),
  status: Joi.string().required(),
});

module.exports = {
  EditProfileSchema,
  ResetPasswordSchema,
  AddressSchema,
  createProductSchema,
  paymentCardSchema,
  OrderSchema,
  categorySchema,
};