const statusCode = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  unknown: 500
}

const navLinksDefault = {
	'/': 'Home',
	'/register': 'Register',
	'/login': 'Log in',
	'/logout': 'Log out',
	'/add-post': 'Add Post',
	'/view-posts': 'View Posts'
}

module.exports = {
  statusCode,
  navLinksDefault
};