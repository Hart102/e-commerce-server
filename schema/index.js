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

module.exports = { loginSchema, registerationSchema };
