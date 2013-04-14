var mongoose = require('mongoose');
var User = require('./user.js');
var Group = require('./group.js');

var courseSchema = new mongoose.Schema({
  name: String,
  ects: Number,
  group: String,
  description: String,
  limit: Number,
  _teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

courseSchema.methods.getState = function (userId, cb) {
  var course = this;
  User.findOne({_id: userId}, function (err, user) {
    console.log('user is ');
    console.log(user);
    Group.getActiveEnrollment(user, course._id, function (res) {
      console.log('res is ');
      console.log(res);
      if (res) {
        cb('Записан');
      } else {
        // get from queue;
        cb('not enrolled');
      }
    });
  });
};


var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

