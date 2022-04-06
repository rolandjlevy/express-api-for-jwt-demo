const jwt = require('jsonwebtoken');
const secretKey = process.env.TOKEN_SECRET;
const { statusCode } = require('./utils');

const generateToken = ({ username, customerId }) => {
  console.log('generateToken');
  return jwt.sign({ username, customerId }, secretKey, { expiresIn: '6h' });
}

const verifyToken = (req, res, next) => {
  console.log('///////////// verifyToken called');
  const jwttoken = req.cookies.jwttoken;
  try {
    const data = jwt.verify(jwttoken, secretKey);
    const { username, customerId } = data;
    console.log('=====================', { data, jwttoken, username, customerId });
    req.username = username;
    req.customerId = customerId;
    next();
  } catch (error) {
    console.log('///////////// error', error);
    const customError = {
      name: 'Authorization error',
      message: `Only logged-in users can access this page`,
      statusCode: statusCode.unauthorized
    }
    next(customError);
  }
}

module.exports = { 
  generateToken,
  verifyToken
};