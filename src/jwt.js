const jwt = require('jsonwebtoken');
const secretKey = process.env.TOKEN_SECRET;

const generateToken = ({ username, customerId }) => {
  console.log('generateToken');
  return jwt.sign({ username, customerId }, secretKey, { expiresIn: '1h' });
}

const verifyToken = (req, res, next) => {
  console.log('verifyToken');
  const jwttoken = req.cookies.jwttoken;
  try {
    const data = jwt.verify(jwttoken, secretKey);
    const { username, customerId } = data;
    req.username = username;
    req.customerId = customerId;
    return next();
  } catch (error) {
    const customError = {
      name: 'Authorization error',
      message: `Only logged-in users can access this page`,
      statusCode: statusCode.unauthorized
    }
    return next(customError);
  }
}

module.exports = { 
  generateToken,
  verifyToken
};