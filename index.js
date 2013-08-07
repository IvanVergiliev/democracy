var Democracy = require('./democracy.js');

// TODO(ivan): When the reCaptcha is working, disable it in a parameter for testing.
// Or implement a ReCaptchaChecker class and mock it for testing.
var d = new Democracy({dbString: 'mongodb://localhost/hackfmi'});
