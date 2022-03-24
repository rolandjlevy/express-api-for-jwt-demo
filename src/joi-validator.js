const Joi = require('joi');
const createHttpError = require('http-errors');
const schemas = require('./joi-schemas.js');
const { statusCode } = require('./utils.js');

const validator = (name) => {
  if (!schemas.hasOwnProperty(name)) {
    throw new Error(`The '${name}' validator does not exist`);
  }
  return async function(req, res, next) {
    try {
      const validated = await schemas[name].validateAsync(req.body);
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

module.exports = { validator }; 