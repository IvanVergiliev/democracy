var Democracy = require('./server/democracy.js');

var config = require('./config.js');

// TODO(ivan): When the reCaptcha is working, disable it in a parameter for testing.
// Or implement a ReCaptchaChecker class and mock it for testing.
var d = new Democracy(config);
