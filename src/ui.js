const moment = require('moment');
const formatJson = (obj) => `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`;

const getPage = ({ heading, content, json = true }) => {
  let body = '';
  if (content) {
    body = json ? `<p>${formatJson(content)}</p>` : `<p>${content}</p>`;
  }
  return `
    <h2>${heading}</h2>
    ${body}
    <p><a href="/">⬅ Home</a></p>
  `;
}

const displayPost = (post) => {
  const { title, description, createdAt, _id } = post;
  return `<ul>
    <li>Title: ${title}</li>
    <li>Description: ${description}</li>
    <li>Registered: ${moment(createdAt).format('Do MMMM, YYYY')}</li>
    <li>ID: ${_id}</li>
  </ul>`;
};

module.exports = { 
  getPage,
  displayPost
};