const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const formatJson = (obj) => `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`;

const {
  getPosts, 
  addPost,
  getPostById
} = require('./data/posts.js');

// use the Router

app.get('/', (req, res) => {
  const href = (n) => `<a href="/posts/${n}">${n}</a>`;
  res.send(`
    <h2>Home</h2>
    <p><a href="/posts">View posts</a></p>
    <p><a href="/add">Add post</a></p>
    <p><a href="/test">Non-existent endpoint</a></p>
    <p>View post: ${href(1)} | ${href(2)} | ${href(3)} | ${href(19)}
    </p>
  `);
});

app.get('/posts', (req, res) => {
  const data = formatJson(getPosts());
  res.status(200).send(data);
});

app.get('/posts/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const post = getPostById(id);
  if (!post) {
    const error = {
      message: `post with ID ${id} not found`,
      statusCode: 403
    }
    return next(error);
  }
  res.status(200).send(`
    <h3>This is post ${id}</h3>
    ${formatJson(post)}
    <p><a href="/">⬅ Home</a></p>
  `);
});

app.get('/add', (req, res) => {
  res.send(`
    <h2>Add post</h2>
    <form method="post" action="/add">
      <p><input name="title"></p>
      <p><input name="body"></p>
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post('/add', (req, res, next) => {
  const { title, body } = req.body;
  if (!title || !body) {
    const error = {
      message: `title and body must be supplied`,
      statusCode: 400
    }
    return next(error);
  }
  const post = addPost({ title, body });
  res.status(200).send(`Added: ${formatJson(post)}`);
});

// wildcard route throws 302 error (temporary redirect)
app.get('*', (req, res, next) => {
  const error = {
    message: `Unable to access ${req.originalUrl}`,
    statusCode: 302
  }
  return next(error);
});

// middleware for handing errors
app.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  res.status(statusCode).json({ error })
});

app.listen(port, () => console.log('Listening on port', port));