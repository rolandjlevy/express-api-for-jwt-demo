const Joi = require('joi');

const convertToParam = (obj) => (
  Object
    .entries(obj)
    .map(([name, param]) => ({ name, param }))
    .shift());

const getErrorMessages = (field, tests) => {
  return tests.reduce((acc, item) => {
    let test = { name: item };
    if (typeof item !== 'string') test = { ...test, ...convertToParam(item) };
    (() => ({
      'required': acc['any.required'] = `${field} is a required field`,
      'string': acc['string.base'] = `${field} must be text`,
      'empty': acc['string.empty'] = `${field} cannot be empty`,
      'min': acc['string.min'] = `${field} must have a minimum length of ${test.param}`,
      'max': acc['string.max'] = `${field} must have a maximum length of ${test.param}`,
      'email': acc['string.email'] = `${field} must be a valid email`,
      'lowercase': acc['string.lowercase'] = `${field} must only contain lowercase characters`,
    }))()[test.name];
    return acc;
  }, {});
}

const register = Joi.object({
  username: Joi
    .string()
    .min(6)
    .max(32)
    .required()
    .messages(getErrorMessages('username', 
      ['string', 'empty', { min: 6 }, { max: 32 }, 'required'])),
  email: Joi
    .string()
    .email()
    .insensitive()
    .lowercase()
    .required()
    .messages(getErrorMessages('email', 
      ['string', 'empty', 'email', 'lowercase', 'required'])),
  password: Joi
    .string()
    .min(6)
    .max(64)
    .required()
    .messages(getErrorMessages('password', 
      ['string', 'empty', { min: 6 }, { max: 64 }, 'required'])),
  confirmedpassword: Joi
    .string()
    .min(6)
    .max(64)
    .required()
    .messages(getErrorMessages('confirmedpassword', 
      ['string', 'empty', { min: 6 }, { max: 64 }, 'required'])),
});

const login = Joi.object({
  username: Joi
    .string()
    .min(6)
    .required()
    .messages(getErrorMessages('username', 
       ['string', 'empty', { min: 6 }])),
  password: Joi
    .string()
    .min(6)
    .required()
    .messages(getErrorMessages('password', 
      ['string', 'empty', { min: 6 }])),
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