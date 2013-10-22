var mongoose = require('mongoose');

var Enrollment = require('./enrollment.js');
var eventManager = require('./eventManager.js');
var Group = require('./group.js');
var User = require('./user.js');

var courseSchema = new mongoose.Schema({
  name: String,
  ects: Number,
  group: String,
  description: String,
  limit: Number,
  enrolled: {
    type: Number,
    'default': 0
  },
  _teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

courseSchema.statics.reserveIfFree = function (courseId, count, cb) {
  Course.findByIdAndUpdate(courseId, {$inc: {enrolled: count}}, {'new': true}, function (err, course) {
    if (course.enrolled > course.limit) {
      course.enrolled -= count;
      course.save(function () {
        cb(false);
      });
    } else {
      cb(true);
    }
  });
};

courseSchema.statics.enroll = function (userId, courseId, cb) {
  Group.reserveIfFree(userId, 1, function (ok) {
    if (!ok) {
      // TODO: handle these(along with CourseFull) in the front end.
      return cb('GroupLimitExceeded');
    }
    Group.addGroup(userId, null, 1, function (err, group) {
      group.addEnrollment(courseId, function (err, enrollment) {
        eventManager.emit('stateChanged', courseId);
        eventManager.emit('newQueueEntry', courseId);
        cb(null);
      });
    });
  });
};

courseSchema.statics.enrollFromQueue = function (courseId) {
  console.log('calling enrollFromQueue');
  Course.reserveIfFree(courseId, 1, function (ok) {
    if (!ok) {
      return cb('CourseFull');
    }
    Enrollment.findOneAndUpdate(
      {_course: courseId, enrolled: false},
      {enrolled: true},
      {sort: 'startDate'},
      function (err, res) {
        console.log(err);
        console.log(res);
      });
  });
};

courseSchema.statics.unenroll = function (userId, courseId, cb) {
  console.log('userId: ' + userId + ', courseId: ' + courseId);
  Enrollment.findOneAndUpdate(
    {_course: courseId, _user: userId, enrolled: true},
    {enrolled: false},
    {'new': false},
    function (err, res) {
      console.log('err is ' + err);
      console.log('res is ' + res);
      if (err || !res || !res.enrolled) {
        return cb(false);
      }
      eventManager.emit('freeSpot', courseId);
      cb(true);
    });
};

courseSchema.methods.getState = function (userId, cb) {
  var course = this;
  Group.getActiveEnrollment(userId, course._id, function (res) {
    if (res) {
      cb('Enrolled');
    } else {
      Group.getQueueEntry(userId, course._id, function (res) {
        if (res) {
          cb('You are in queue');
        } else {
          cb(course.hasFreeSpots() ? 'Free positions' : 'Full');
        }
      });
    }
  });
};

courseSchema.methods.hasFreeSpots = function () {
  return this.enrolled < this.limit;
};

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

