const moment = require('moment');

const displayPost = ({ title, description, createdAt, _id }) => (
  `<ul>
    <li>Title: ${title}</li>
    <li>Description: ${description}</li>
    <li>Registered: ${moment(createdAt).format('Do MMMM, YYYY')}</li>
    <li>ID: ${_id}</li>
  </ul>`);

const statusCode = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  unknown: 500
}

module.exports = {
  displayPost,
  statusCode
};