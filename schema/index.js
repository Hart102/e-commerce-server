const Joi = require("joi");

const registerationSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const locationSchema = Joi.object().keys({
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  zipcode: Joi.string().required(),
  phone: Joi.string().required(),
});

const createProductSchema = Joi.object().keys({
  name: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.number().required(),
  status: Joi.string().required(),
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
  // paymentCardId: Joi.number().required(),
  productsId: Joi.array().required(),
  totalPrice: Joi.number().required(),
});

module.exports = {
  loginSchema,
  registerationSchema,
  locationSchema,
  createProductSchema,
  paymentCardSchema,
  OrderSchema,
};
