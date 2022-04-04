const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const Customer = require('./models/Customer');
const Post = require('./models/Post');
const { 
  generateToken, 
  verifyToken, 
  getPage, 
  displayPost, 
  statusCode, 
  validator 
} = require('./src');

const navLinks = {
	'/': 'Home',
	'/register': 'Register',
	'/login': 'Login',
	'/add-post': 'Add Post',
	'/posts': 'View Posts'
}

// all routes middleware
router.use((req, res, next) => {
  res.locals.currentPage = req.originalUrl;
  res.locals.navLinks = navLinks;
  next();
});

// Homepage
router.get('/', (req, res) => {
  res.status(200).render('pages/index', { title: 'Authentication App' });
});

// Registration form
router.get('/register', (req, res) => {
  res.status(200).render('pages/register', { title: 'Register new user' });
});

// Registration form result
router.post('/register', validator('register'), (req, res, next) => {
  const { username, email, password } = req.body;
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
  res.status(200).render('pages/login', { title: 'Login' });
});

// Login result with signed JWT token
router.post('/login', validator('login'), (req, res, next) => {
  const { username, password } = req.body;
  console.log({ username, password })
  Customer.findOne({ username })
    .then(customer => {
      if (!customer) {
        console.log('Username does not exist');
        const error = {
          message: `Username ${customer.username} does not exist`,
          statusCode: statusCode.unprocessable
        }
        return next(error);
      } else {
        customer.comparePassword(password)
        .then(matched => {
          if (matched) {
            console.log('matched');
            const page = getPage({ 
              heading: 'Successful login', 
              content: `${username}, you are now logged in. <a href="/customer/${customer._id}">View your details</a>`,
              json: false
            });
            const token = generateToken({ 
              username, 
              customerId: customer._id
            });
            const options = { maxAge: 360 * 1000, httpOnly: true };
            console.log('token:', token);
            res.cookie('jwttoken', token, options);
            return res.status(200).send(page);
          } else {
            console.log('Incorrect pass');
            const error = {
              message: 'Incorrect password',
              statusCode: statusCode.unauthorized
            }
            return next(error);
          }
        })
        .catch((error) => {
          console.log({ error });
          return next(error);
        });
      }
    })
    .catch((error) => {
      return next(error);
    });
});

router.get('/customer/:customerId', (req, res, next) => {
  const { customerId } = req.params;
  Customer.findOne({ _id: customerId })
    .then(customer => {
      const { username, email, createdAt, ...rest } = customer;
      const page = getPage({ 
        heading: 'View customer details', 
        content: { username, email, createdAt }
      });
      return res.status(200).send(page);
    })
    .catch((error) => {
      const customError = {
        name: 'Customer not found',
        message: `Customer ${customerId} does not exists`,
        statusCode: statusCode.notFound
      }
      return next(customError);
    });
});

// Add a post form
router.get('/add-post', verifyToken, (req, res) => {
  try {
    if (req.username) {
      res.status(200).render('pages/add-post', { title: 'Add Post' });
    }
  } catch (error) {
    error.statusCode = statusCode.unauthorized;
    return next(error);
  }
});

// Add a post result
router.post('/add-post', validator('post'), verifyToken, async (req, res, next) => {
  const { title, description } = req.body;
  try {
    if (req.username) {
      try {
        const newPost = new Post({ 
          title, 
          description,
          customerId: req.customerId
        });
        const response = await newPost.save();
        const page = getPage({ 
          heading: 'Post saved', 
          content: `The post named '${title}' has been saved into your account`,
          json: false
        });
        return res.status(200).send(page);
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
    str += '<p><a href="/">⌂ Home</a></p>';
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
        statusCode: statusCode.notFound
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
    statusCode: statusCode.notFound
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