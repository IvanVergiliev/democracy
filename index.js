var Democracy = require('./server/democracy.js');

if (process.env.ON_HEROKU) {
  var config = require('./config-env.js');
} else {
  var config = require('./config.js');
}

// TODO(ivan): When the reCaptcha is working, disable it in a parameter for testing.
// Or implement a ReCaptchaChecker class and mock it for testing.
var d = new Democracy(config);
