const moment = require('moment-timezone');
moment.tz.setDefault('Europe/London');

const statusCode = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  unknown: 500
}

const navLinksDefault = {
	'/register': { label: 'Register', icon: 'fa-user-plus' },
	'/login': { label: 'Log in', icon: 'fa-right-to-bracket' },
	'/logout': { label: 'Log out', icon: 'fa-right-to-bracket' },
	'/add-post': { label: 'Add Post', icon: 'fa-circle-plus' },
	'/view-posts': { label: 'View Posts', icon: 'fa-address-card' }
}

const getMaxHours = () => {
  const cookieMaxHours = Number(process.env.COOKIE_MAX_HOURS);
  const oneHour = 60 * 60 * 1000;
  const daylightSavingsHour = moment().isDST() ? 1 : 0;
  return (cookieMaxHours + daylightSavingsHour) * oneHour;
}

module.exports = {
  statusCode,
  navLinksDefault,
  getMaxHours
};