const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const { addPost, getPosts, getPostById } = require('./src/posts.js');
const { home, getPage, addPostForm } = require('./src/ui.js');

// Home
router.get('/', (req, res) => {
  res.status(200).send(home);
});

// Get all posts
router.get('/posts', (req, res) => {
  const page = getPage({ heading: 'View all posts', content: getPosts() });
  res.status(200).send(page);
});

// Get a single post
router.get('/posts/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const post = getPostById(id);
  if (!post) {
    const error = {
      message: `Post with ID ${id} not found`,
      statusCode: 400
    }
    return next(error);
  }
  const page = getPage({ heading: `Post ${id}`, content: post });
  res.status(200).send(page);
});

// Add a post form
router.get('/add', (req, res) => {
  const page = getPage({ heading: 'Add post', content: addPostForm, json: false });
  res.send(page);
});

// Add a post result
router.post('/add', (req, res, next) => {
  const { title, body } = req.body;
  if (!title || !body) {
    const error = {
      message: `Both title and body must be supplied`,
      statusCode: 400
    }
    next(error);
  }
  const addedPost = addPost({ title, body });
  const page = getPage({ heading: 'Added', content: addedPost });
  res.status(200).send(page);
});

// wildcard route for 404s
router.get('*', (req, res, next) => {
  const error = { statusCode: 404 };
  next(error);
});

// middleware for error handing 
router.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  let page = getPage({ heading: 'Error', content: error });
  if (statusCode === 404) {
    const content = `Unable to access ${req.originalUrl}`;
    page = getPage({ heading: 'Page Not Found', content, json: false });
  }
  res.status(statusCode).send(page);
});

module.exports = router;