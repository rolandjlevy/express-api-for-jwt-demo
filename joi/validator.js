const createHttpError = require('http-errors');
const Joi = require('joi');
const schemas = require('./schemas.js');
const { statusCode } = require('../src/utils.js');

const middleware = (validator) => {
  if (!schemas.hasOwnProperty(validator)) {
    throw new Error(`The '${validator}' validator does not exist`);
  }
  return async function(req, res, next) {
    try {
      const validated = await schemas[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi) {
        const errorObject = createHttpError(
          statusCode.unprocessable, 
          { message: error.message 
        });
        next(errorObject);
      } else {
        next(createHttpError(statusCode.unknown));
      }
    }
  }
}

module.exports = middleware; 