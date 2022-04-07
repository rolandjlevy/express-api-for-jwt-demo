const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const moment = require('moment-timezone');
moment.tz.setDefault('Europe/London');

router.use(cookieParser());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const Customer = require('./models/Customer');
const Post = require('./models/Post');
const { 
  generateToken, 
  verifyToken, 
  isLoggedIn,
  statusCode,
  navLinksDefault,
  validator 
} = require('./src');

// all routes middleware
router.use((req, res, next) => {
  const jwttoken = req.cookies.jwttoken;
  let navLinks = {...navLinksDefault};
  if (jwttoken && isLoggedIn(jwttoken)) {
    delete navLinks['/register'];
    delete navLinks['/login'];
  } else {
    delete navLinks['/logout'];
  }
  res.locals.currentPage = req.originalUrl;
  res.locals.navLinks = navLinks;
  next();
});

// Info page
router.get('/info', (req, res) => {
  const { title, content, json } = router.page;
  res.status(200).render('pages/info', { title, content, json });
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
        router.page = { 
          title: 'Successful registration', 
          content: `Welcome ${result.username}, thank you for registering.`,
          json: false
        };
        res.redirect('/info');
      })
    }
  })
  .catch((error) => {
    return next(error);
  });
});

// Login form
router.get('/login', (req, res) => {
  res.status(200).render('pages/login', { title: 'Login' });
});

const getMaxHours = () => {
  const cookieMaxHours = Number(process.env.COOKIE_MAX_HOURS);
  const oneHour = 60 * 60 * 1000;
  const daylightSavingsHour = moment().isDST() ? 1 : 0;
  return (cookieMaxHours + daylightSavingsHour) * oneHour;
}

// Login result with signed JWT token
router.post('/login', validator('login'), (req, res, next) => {
  const { username, password } = req.body;
  Customer.findOne({ username })
    .then(customer => {
      if (!customer) {
        const error = {
          message: `Username ${customer.username} does not exist`,
          statusCode: statusCode.unprocessable
        }
        return next(error);
      } else {
        customer.comparePassword(password)
        .then(matched => {
          if (matched) {
            const token = generateToken({ 
              username, 
              customerId: customer._id
            });
            const options = { maxAge: getMaxHours(), httpOnly: true };
            res.cookie('jwttoken', token, options);
            router.page = { 
              title: 'Successful login', 
              content: `${username}, you are now logged in. You can <a href="/add-post">Add</a>, <a href="/view-posts">View</a>, and Delete posts. You can also <a href="/customer/${customer._id}">view your details</a>`,
              json: false
            };
            res.redirect('/info');
          } else {
            const error = {
              message: 'Incorrect password',
              statusCode: statusCode.unauthorized
            }
            return next(error);
          }
        })
        .catch((error) => {
          console.log('1. /////// error:', error);
          return next(error);
        });
      }
    })
    .catch((error) => {
      console.log('2. /////// error:', error);
      return next(error);
    });
});

router.get('/logout', (req, res) => {
  const maxAge = 1;
  const options = { maxAge, httpOnly: true };
  res.cookie('jwttoken', '', options);
  router.page = { 
    title: 'Logged out', 
    content: `You have logged out`,
    json: false
  };
  res.redirect('/info');
});

router.get('/customer/:customerId', (req, res, next) => {
  const { customerId } = req.params;
  Customer.findOne({ _id: customerId })
    .then(customer => {
      const { username, email, createdAt, ...rest } = customer;
      router.page = { 
        title: 'View customer details', 
        content: { username, email, createdAt },
        json: true
      };
      res.redirect('/info');
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
        router.page = { 
          title: 'Post saved', 
          content: `The post named "${title}" has been saved to your account`,
          json: false
        };
        res.redirect('/info');
      } catch (error) {
        return next(error);
      }
    }
  } catch (error) {
    error.statusCode = statusCode.unauthorized;
    return next(error);
  }
});

// Delete a post
router.get('/delete-post/:_id', verifyToken, async (req, res) => {
  const { _id } = req.params;
  try {
    const postExists = await Post.countDocuments({ _id });
    if (_id && postExists) {
      try {
        await Post.deleteOne({ _id });
        router.page = { 
          title: 'Post deleted', 
          content: `The post has been deleted from your account`,
          json: false
        };
        res.redirect('/info');
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
router.get('/view-posts', verifyToken, (req, res) => {
 Post.find({ customerId: req.customerId })
  .then(posts => {
    const title = `View ${req.username}'s posts`;
    res.status(200).render('pages/view-posts', { title, posts, moment });
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
    router.page = {
      title: `Post: ${title}`, 
      content: post,
      json: true
    }
    res.redirect('/info');
  });
});

// wildcard route for 404s
router.get('*', (req, res, next) => {
  const error = { 
    message: 'Page not found', 
    statusCode: statusCode.notFound
  };
  console.log('3. /////// error:', error);
  next(error);
});

// middleware for error handing 
router.use((error, req, res, next) => {
  const { statusCode = 500 } = error;
  let page = { 
    title: 'Error', 
    content: error, 
    json: true
  };
  if (statusCode === statusCode.notFound) {
    const content = `Unable to access ${req.originalUrl}`;
    page = { 
      title: 'Page Not Found', 
      content, 
      json: true
    };
  }
  console.log('4. /////// error:', error);
  router.page = page;
  res.redirect('/info');
});

module.exports = router;