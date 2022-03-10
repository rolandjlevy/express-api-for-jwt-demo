const linksToPosts = (max = 10) => {
  let n = 0;
  let str = '';
  while (n++ < max) str += `<a href="/posts/${n}">${n}</a>\n`;
  return str;
}

const formatJson = (obj) => `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`;

const home = `
  <h2>Home</h2>
  <ul>
    <li><a href="/posts">View all posts</a></li>
    <li><a href="/add">Add post</a></li>
    <li>View post: ${linksToPosts()}</li>
    <li>View non-existent post: <a href="/posts/100">100</a></li>
    <li>Try non-existent endpoint: <a href="/test">/test</a></li>
  </ul>
`;

const addPostForm = `
  <form method="post" action="/add">
    <p><input name="title"></p>
    <p><input name="body"></p>
    <button type="submit">Submit</button>
  </form>
`;

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

module.exports = {
  home,
  getPage,
  addPostForm
}