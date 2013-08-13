var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
  enrolledIn: Number // TODO: Move this and some other stuff to a separate Student class ?
});

userSchema.statics.exists = function (user, pass, cb) {
  this.findOne({username: user, password: pass}, function(err, user) {
    cb(err, user);
  });
};

userSchema.methods.maxSimultaneous = function () {
  // TODO: make this smarter according to rating.
  return 100;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
