const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const secretKey = process.env.TOKEN_SECRET;
const correctPassword = process.env.PASSWORD;

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const { addPost, getPosts, getPostById } = require('./src/posts.js');
const { home, getPage, addPostForm, loginForm } = require('./src/ui.js');

// Home
router.get('/', (req, res) => {
  const loggedIn = req.cookies.jwttoken;
  res.status(200).send(home(loggedIn));
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
  res.status(200).send(page);
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

// Login form
router.get('/login', (req, res) => {
  const page = getPage({ heading: 'Login', content: loginForm, json: false });
  res.status(200).send(page);
});

const generateAccessToken = (username) => {
  return jwt.sign({ username }, secretKey, { expiresIn: '1h' });
}

// Login with signed JWT token
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  let error;
  if (!username || !password) {
    error = {
      message: `Both title and body must be supplied`,
      statusCode: 400
    }
    next(error);
  } else if (password !== correctPassword) {
    error = {
      message: `Password incorrect, please try again`,
      statusCode: 403
    }
    next(error);
  }
  const token = generateAccessToken(username);
  res.cookie('jwttoken', token, { maxAge: 360 * 1000, httpOnly: true }).redirect('/');
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, data) => {
    if (err) return res.sendStatus(403);
    req.data = data;
    next();
  });
}

router.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'This is a protected route'
  });
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