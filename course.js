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
    console.log('user is ');
    console.log(user);
    Group.getActiveEnrollment(user, course._id, function (res) {
      console.log('res(active enrollment) is ');
      console.log(res);
      if (res) {
        cb('Enrolled');
      } else {
        Group.getQueueEntry(userId, course._id, function (res) {
          console.log('res(queue entry) is ');
          console.log(res);
          if (res) {
            cb('You are in queue');
          } else {
            Enrollment.find({_course: course.id})
            .exists('endDate', false)
            .exec(function (err, enrollments) {
              if (enrollments.length < course.limit) {
                cb('Free positions');
              } else {
                cb('Full');
              }
            });
          }
        });
      }
    });
  });
};

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

