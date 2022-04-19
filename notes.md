# Notes

### Todo
- for /posts/:title endpoint, use _id instead of title 

### Done
- allow users to edit posts
- Login / Logout link toggle in nav
- when registering, on success try to log out the previous user and log in new user. Go to login page and pre fill the fields
- Create registration and login for users
- Each user has a customerId which maps to the posts collection
- Logged-in customers can only see their own posts
- Implement EJS
- Add form validation using [Joi](https://joi.dev/api/?v=17.6.0) or express-validator/
- Improve UI with Bootstrap

### JWT tutorials
- https://www.youtube.com/watch?v=xBYr9DxDqyU
- https://www.youtube.com/watch?v=mbsmsi7l3r4
- https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
- https://dev.to/franciscomendes10866/using-cookies-with-jwt-in-node-js-8fn
- https://www.bezkoder.com/node-js-express-login-mongodb/
- https://www.youtube.com/watch?v=jQn74jB5dg0
- https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
  
### Docs
- https://www.npmjs.com/package/jsonwebtoken
- https://www.npmjs.com/package/uuid-mongodb 
- https://github.com/cdimascio/uuid-mongodb
- https://joi.dev/api/?v=17.6.0
  
### Reference
- https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
- https://dev.to/nyctonio/authentication-in-node-js-with-mongodb-bcrypt-and-jwt-web-tokens-with-cookies-hl3
- https://replit.com/talk/ask/how-to-connect-a-mongodb-altas-to-expreesss/30203
- https://replit.com/talk/ask/How-to-use-Mongodb-with-Replit/138624
- https://www.geeksforgeeks.org/how-to-implement-jwt-authentication-in-express-js-app/
- https://dev.to/tayfunakgc/middleware-based-joi-validation-in-expressjs-2po5
- https://dev.to/franciscomendes10866/using-json-web-tokens-with-node-js-22c6

### Joi custom error messages
- https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages

```js
messages: {
  'string.alphanum': '{{#label}} must only contain alpha-numeric characters',
  'string.base': '{{#label}} must be a string',
  'string.base64': '{{#label}} must be a valid base64 string',
  'string.creditCard': '{{#label}} must be a credit card',
  'string.dataUri': '{{#label}} must be a valid dataUri string',
  'string.domain': '{{#label}} must contain a valid domain name',
  'string.email': '{{#label}} must be a valid email',
  'string.empty': '{{#label}} is not allowed to be empty',
  'string.guid': '{{#label}} must be a valid GUID',
  'string.hex': '{{#label}} must only contain hexadecimal characters',
  'string.hexAlign': '{{#label}} hex decoded representation must be byte aligned',
  'string.hostname': '{{#label}} must be a valid hostname',
  'string.ip': '{{#label}} must be a valid ip address with a {{#cidr}} CIDR',
  'string.ipVersion': '{{#label}} must be a valid ip address of one of the following versions {{#version}} with a {{#cidr}} CIDR',
  'string.isoDate': '{{#label}} must be in iso format',
  'string.isoDuration': '{{#label}} must be a valid ISO 8601 duration',
  'string.length': '{{#label}} length must be {{#limit}} characters long',
  'string.lowercase': '{{#label}} must only contain lowercase characters',
  'string.max': '{{#label}} length must be less than or equal to {{#limit}} characters long',
  'string.min': '{{#label}} length must be at least {{#limit}} characters long',
  'string.normalize': '{{#label}} must be unicode normalized in the {{#form}} form',
  'string.token': '{{#label}} must only contain alpha-numeric and underscore characters',
  'string.pattern.base': '{{#label}} with value {:[.]} fails to match the required pattern: {{#regex}}',
  'string.pattern.name': '{{#label}} with value {:[.]} fails to match the {{#name}} pattern',
  'string.pattern.invert.base': '{{#label}} with value {:[.]} matches the inverted pattern: {{#regex}}',
  'string.pattern.invert.name': '{{#label}} with value {:[.]} matches the inverted {{#name}} pattern',
  'string.trim': '{{#label}} must not have leading or trailing whitespace',
  'string.uri': '{{#label}} must be a valid uri',
  'string.uriCustomScheme': '{{#label}} must be a valid uri with a scheme matching the {{#scheme}} pattern',
  'string.uriRelativeOnly': '{{#label}} must be a valid relative uri',
  'string.uppercase': '{{#label}} must only contain uppercase characters'
}

// example:
username: Joi.string().min(6).max(32).required().messages({
  'string.base': `username must be text`,
  'string.empty': 'username cannot be empty',
  'string.min': 'username must have a minimum length of 6',
  'any.required': 'username is a required field'
});
```