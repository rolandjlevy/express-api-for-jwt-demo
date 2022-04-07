const jwt = require('jsonwebtoken');
const secretKey = process.env.TOKEN_SECRET;
const cookieMaxHours = process.env.COOKIE_MAX_HOURS;
const { statusCode } = require('./utils');

const generateToken = ({ username, customerId }) => {
  return jwt.sign({ username, customerId }, secretKey, { expiresIn: `${cookieMaxHours}h` });
}

const verifyToken = (req, res, next) => {
  const jwttoken = req.cookies.jwttoken;
  try {
    const data = jwt.verify(jwttoken, secretKey);
    const { username, customerId } = data;
    req.username = username;
    req.customerId = customerId;
    next();
  } catch (error) {
    const customError = {
      name: 'Authorization error',
      message: `Only logged-in users can access this page`,
      statusCode: statusCode.unauthorized
    }
    next(customError);
  }
}

const isLoggedIn = (jwttoken = '') => {
  const data = jwt.verify(jwttoken, secretKey);
  return data && data.username || false;
}

module.exports = { 
  generateToken,
  verifyToken,
  isLoggedIn
};