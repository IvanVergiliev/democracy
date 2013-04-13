var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String
});

userSchema.statics.exists = function (user, pass, cb) {
  this.findOne({username: user, password: pass}, function(err, user) {
    cb(err, user);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
