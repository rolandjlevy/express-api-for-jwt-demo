const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const secretKey = process.env.TOKEN_SECRET;
const correctPassword = process.env.PASSWORD;
const unauthorizedResponse = 401;
const unprocessableEntity = 403;

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
  // const loggedIn = req.cookies.jwttoken;
  res.status(200).sendFile('/index.html', { root: './public' });
});

// Register form
router.get('/register', (req, res) => {
  res.status(200).sendFile('/register.html', { root: './public' });
});

// Register form result
router.post('/register', (req, res, next) => {
  const { username, email, password } = req.body;
  Customer.findOne({ username })
  .then(customer => {
    if (customer) {
      const error = new Error(`Sorry, the username ${username} already exists.`);
      error.statusCode = unprocessableEntity;
      return next(error);
    } else {
      const newUser = new Customer({ username, email, password });
      newUser.save()
      .then(result => {
        const page = getPage({ 
          heading: 'Successful registration', 
          content: `Welcome ${result.username}, thank you for registering.`,
          json: false
        });
        return res.status(200).send(page);
      })
    }
  })
  .catch(err => {
    return next(err);
  });
});

// Login form
router.get('/login', (req, res) => {
  res.status(200).sendFile('/login.html', { root: './public' });
});

const generateAccessToken = (username) => {
  return jwt.sign({ username }, secretKey, { expiresIn: '1h' });
}

// Login result with signed JWT token
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  Customer.findOne({ username })
    .then(customer => {
      if (!customer) {
        const error = new Error(`Username does not exist`);
        error.status = unprocessableEntity; // 403
        return next(error);
      } else {
        customer.comparePassword(password)
        .then(matched => {
          if (matched) {
            const page = getPage({ 
              heading: 'Successful login', 
              content: `${username}, you are now logged in. <a href="#">View your details</a>`, // href="/user/${customer._id}"
              json: false
            });
            // Add the user's id here
            const token = generateAccessToken(username);
            const options = { maxAge: 360 * 1000, httpOnly: true };
            res.cookie('jwttoken', token, options);
            return res.status(200).send(page);
          } else {
            const error = new Error(`Incorrect password.`);
            error.statusCode = unauthorizedResponse; // 401
            return next(error);
          }
        })
        .catch((error) => {
          return next(error);
        });
      }
    })
    .catch((error) => {
      return next(error);
    });
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // console.log(authHeader);
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
router.get('/add-post', (req, res) => {
  res.status(200).sendFile('/add-post.html', { root: './public' });
});

// Add a post result
router.post('/add-post', async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    const error = {
      message: `Title and description must be supplied`,
      statusCode: 400
    }
    next(error);
  }
  // customerId needs to be from logged-in user's Id
  // get the id from the jwt in the cookie
  // Look into uuid-mongodb - see notes
  const customerId = uuidv4();
  // const customerId = req.cookies.jwttoken;
  // const data = jwt.verify(token, "YOUR_SECRET_KEY");
  // req.userId = data.id;
  // req.userRole = data.role;

  // const token = req.cookies.jwttoken;
  // const data = jwt.verify(token, secretKey);
  // console.log('req.cookies.jwttoken:', data)

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