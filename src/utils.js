const moment = require('moment');
const formatJson = (obj) => `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`;

const getPage = ({ heading, content, json = true }) => {
  let body = '';
  if (content) {
    body = json ? `<p>${formatJson(content)}</p>` : `<p>${content}</p>`;
  }
  return `<h1>${heading}</h1>${body}<p><a href="/">⌂ Home</a></p>`;
}

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
  getPage,
  displayPost,
  statusCode
};