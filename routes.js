const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const secretKey = process.env.TOKEN_SECRET;
const correctPassword = process.env.PASSWORD;

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static('public'));

const Customer = require('./models/Customer.js');
const Post = require('./models/Post.js');

const { addPost, getPosts, getPostById } = require('./src/posts.js');
const { getPage, displayPost } = require('./src/ui.js');

// Homepage
router.get('/', (req, res) => {
  const loggedIn = req.cookies.jwttoken;
  res.status(200).sendFile('/index.html', { root: './public' });
});

router.get('/register', (req, res) => {
  
});

// Login form
router.get('/login', (req, res) => {
  res.status(200).sendFile('/login.html', { root: './public' });
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
  // Add the user's id here
  const token = generateAccessToken(username);
  res.cookie('jwttoken', token, { maxAge: 360 * 1000, httpOnly: true }).redirect('/');
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
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

// Get all posts
router.get('/posts', (req, res) => {
  // eventually, only get the post for the current user, based on the customerId
 Post.find({  })
  .then(posts => {
    let str = '<h1>View all users</h1>';
    posts.forEach((post, index) => str += displayPost(post));
    str += '<p><a href="/">⬅ Home</a></p>';
    res.status(200).send(str);
  })
  .catch(error => {
    error.statusCode = 400;
    return next(error);
  });
});

// Get a single post
router.get('/posts/:title', (req, res, next) => {
  const { title } = req.params;
  Post.findOne({ title })
  .then(post => {
    if (!post) {
      const error = {
        message: `Post ${title} not found`,
        statusCode: 400
      }
      return next(error);
    }
    const page = getPage({ 
      heading: `Post: ${title}`, 
      content: post 
    });
    res.status(200).send(page);
  });
});

// Add a post form
router.get('/add', (req, res) => {
  res.status(200).sendFile('/add-post.html', { root: './public' });
});

// Add a post result
router.post('/add', async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    const error = {
      message: `Title and description must be supplied`,
      statusCode: 400
    }
    next(error);
  }
  // customerId needs to be logged-in user Id
  // get the id from the jwt in the cookie
  // Look into uuid-mongodb - see notes
  const customerId = uuidv4();
  try {
    const newPost = new Post({ 
      title, 
      description, 
      customerId 
    });
    const response = await newPost.save();
    const message = `The post named '${title}' has been saved`;
    res.status(200).send(message);
  } catch (error) {
    return next(error);
  }
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