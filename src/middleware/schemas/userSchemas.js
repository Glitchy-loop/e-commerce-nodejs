const Joi = require('joi')

const registrationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required(),
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().required(),
  roles: Joi.number()
    .integer()
    .min(0)
    .max(1)
    .required()
})

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().required()
})

module.exports = { registrationSchema, loginSchema }
