var mongoose = require('mongoose');
var User = require('./user.js');
var Group = require('./group.js');
var Enrollment = require('./enrollment.js');

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
    Group.getActiveEnrollment(user, course._id, function (res) {
      if (res) {
        cb('Enrolled');
      } else {
        Group.getQueueEntry(userId, course._id, function (res) {
          if (res) {
            cb('You are in queue');
          } else {
            course.hasFreeSpots(function (hasFreeSpots) {
              cb(hasFreeSpots ? 'Free positions' : 'Full');
            });
          }
        });
      }
    });
  });
};

courseSchema.methods.hasFreeSpots = function (cb) {
  var course = this;
  Enrollment
    .count({_course: course.id, endDate: {$exists: false}})
    .exec(function (err, count) {
      cb(count < course.limit);
    });
};

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

