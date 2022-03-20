const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const secretKey = process.env.TOKEN_SECRET;

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static('public'));

const Customer = require('./models/Customer.js');
const Post = require('./models/Post.js');

const { addPost, getPosts, getPostById } = require('./src/posts.js');
const { getPage, displayPost, statusCode } = require('./src/utils.js');

const generateToken = ({username, customerId }) => {
  return jwt.sign({ username, customerId }, secretKey, { expiresIn: '1h' });
}

const verifyToken = (req, res, next) => {
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

const getToken = (jwttoken) => {
  if (jwttoken) {
    return jwt.verify(jwttoken, secretKey);
  }
  return null;
}

// Homepage
router.get('/', (req, res) => {
  res.status(200).sendFile('/index.html', { root: './public' });
});

// Register form
router.get('/register', (req, res) => {
  res.status(200).sendFile('/register.html', { root: './public' });
});

// Register form result
router.post('/register', (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = Object.values(req.body).some(item => !item.length);
  if (errors) {
    const error = {
      message: `All fields are required.`,
      statusCode: statusCode.badRequest
    }
    return next(error);
  }
  Customer.findOne({ username })
  .then(customer => {
    if (customer) {
      const error = {
        message: `Sorry, the username ${username} already exists.`,
        statusCode: statusCode.unprocessable
      }
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

// Login result with signed JWT token
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = {
      message: `All fields are required.`,
      statusCode: statusCode.badRequest
    }
    return next(error);
  }
  Customer.findOne({ username })
    .then(customer => {
      if (!customer) {
        const error = {
          message: `Username does not exist`,
          statusCode: statusCode.unprocessable
        }
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
            const customerId = customer._id;
            const token = generateToken({ username, customerId });
            const options = { maxAge: 360 * 1000, httpOnly: true };
            res.cookie('jwttoken', token, options);
            return res.status(200).send(page);
          } else {
            const error = {
              message: `Incorrect password`,
              statusCode: statusCode.unauthorized
            }
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

// Add a post form
router.get('/add-post', verifyToken, (req, res) => {
  try {
    if (req.username) {
      res.status(200).sendFile('/add-post.html', { root: './public' });
    }
  } catch (error) {
    error.statusCode = statusCode.unauthorized;
    return next(error);
  }
});

// Add a post result
router.post('/add-post', verifyToken, async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    const error = {
      message: `Title and description are required`,
      statusCode: statusCode.badRequest
    }
    return next(error);
  }
  try {
    if (req.username) {
      try {
        const newPost = new Post({ 
          title, 
          description,
          customerId: req.customerId
        });
        const response = await newPost.save();
        const message = `The post named '${title}' has been saved`;
        res.status(200).send(message);
      } catch (error) {
        return next(error);
      }
    }
  } catch (error) {
    error.statusCode = statusCode.unauthorized;
    return next(error);
  }
});

// Get all posts for loggged-in customer
router.get('/posts', verifyToken, (req, res) => {
 Post.find({ customerId: req.customerId })
  .then(posts => {
    let str = `<h1>View ${req.username}'s posts </h1>`;
    posts.forEach(post => str += displayPost(post));
    str += '<p><a href="/">⬅ Home</a></p>';
    res.status(200).send(str);
  })
  .catch(error => {
    error.statusCode = statusCode.badRequest;
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

// wildcard route for 404s
router.get('*', (req, res, next) => {
  const error = { 
    message: 'Page not found', 
    statusCode: 404 
  };
  next(error);
});

// middleware for error handing 
router.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  let page = getPage({ 
    heading: 'Error', 
    content: error 
  });
  if (statusCode === statusCode.notFound) {
    const content = `Unable to access ${req.originalUrl}`;
    page = getPage({ 
      heading: 'Page Not Found', 
      content, 
      json: false 
    });
  }
  res.status(statusCode).send(page);
});

module.exports = router;