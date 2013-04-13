var mongoose = require('mongoose');
var Group = require('./group.js');

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

userSchema.methods.maxSimultaneous = function () {
  // TODO: make this smarted according to rating.
  return 2;
};

userSchema.methods.canAddGroup = function (maxSize, cb) {
  var user = this;
  var groups = Group.find({_id: this._id}, function (err, groups) {
    console.log('groups: ');
    console.log(groups);
    // TODO: can be replaced with a MongoDB aggregate.
    var sum = 0;
    for (var i = 0; i < groups.length; ++i) {
      sum += groups[i].maxEntries;
    }
    var ok = sum < user.maxSimultaneous();
    cb(ok);
  });
};

userSchema.methods.addGroup = function (name, maxEntries, cb) {
  var group = new Group({
    maxEntries: 1,
    _user: this.id
  });
  group.save(cb);
};

var User = mongoose.model('User', userSchema);

module.exports = User;
