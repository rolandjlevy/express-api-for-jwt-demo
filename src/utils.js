const statusCode = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  unknown: 500
}

// const navLinksDefault = {
// 	'/register': 'Register',
// 	'/login': 'Log in',
// 	'/logout': 'Log out',
// 	'/add-post': 'Add Post',
// 	'/view-posts': 'View Posts'
// }

const navLinksDefault = {
	'/register': { label: 'Register', icon: 'fa-user-plus' },
	'/login': { label: 'Log in', icon: 'fa-right-to-bracket' },
	'/logout': { label: 'Log out', icon: 'fa-right-to-bracket' },
	'/add-post': { label: 'Add Post', icon: 'fa-circle-plus' },
	'/view-posts': { label: 'View Posts', icon: 'fa-address-card' }
}

module.exports = {
  statusCode,
  navLinksDefault
};