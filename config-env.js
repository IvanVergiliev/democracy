module.exports = {
  port: process.env.PORT,
  dbString: process.env.MONGOLAB_URI || 'mongodb://localhost/hackfmi',
  recaptchaPublic: process.env.RECAPTCHA_PUBLIC, // ReCaptcha public key - must register at the ReCaptche Developers site
  recaptchaPrivate: process.env.RECAPTCHA_PRIVATE // ReCaptcha private key - do not publish online.
};

