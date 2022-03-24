const jwt = require('jsonwebtoken');
const secretKey = process.env.TOKEN_SECRET;
const { statusCode } = require('./utils');

const generateToken = ({ username, customerId }) => {
  console.log('generateToken');
  return jwt.sign({ username, customerId }, secretKey, { expiresIn: '1h' });
}

const verifyToken = (req, res, next) => {
  const jwttoken = req.cookies.jwttoken;
  console.log('jwttoken:', jwttoken);
  try {
    const data = jwt.verify(jwttoken, secretKey);
    const { username, customerId } = data;
    req.username = username;
    req.customerId = customerId;
    console.log('data:', data);
    next();
  } catch (error) {
    const customError = {
      name: 'Authorization error',
      message: `Only logged-in users can access this page`,
      statusCode: statusCode.unauthorized
    }
    console.log('error:', error, customError);
    next(customError);
  }
}

module.exports = { 
  generateToken,
  verifyToken
};