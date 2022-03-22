const Joi = require('joi')

const register = Joi.object({
  username: Joi.string().min(6).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  confirmedpassword: Joi.string().min(6).required()
});

const login = Joi.object({
  username: Joi.string().min(6).required(),
  password: Joi.string().min(6).required()
});

const post = Joi.object({
  title: Joi.string().min(6).required(),
  description: Joi.string().min(6).required()
});

module.exports = {
  register,
  login,
  post
}