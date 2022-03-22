const createHttpError = require('http-errors');
const Joi = require('joi');
const schemas = require('./schemas.js');

const middleware = (validator) => {
  if (!schemas.hasOwnProperty(validator)) {
    throw new Error(`'${validator}' validator does not exist`);
  }
  return async function(req, res, next) {
    try {
      const validated = await schemas[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi) {
        return next(createHttpError(422, { 
          message: error.message
        }));
        next(createHttpError(500));
      }
    }
  }
}

module.exports = middleware; 