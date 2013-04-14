var async = require('async');
var mongoose = require('mongoose');
var Enrollment = require('./enrollment.js');

var groupSchema = new mongoose.Schema({
  name: String,
  maxEntries: Number,
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

groupSchema.methods.fix = function (cb) {
  Enrollment
    .find({_group: this._id})
    .exists('endDate', false)
    .populate("_queueEntry")
    .exec(function(err, enrollments) {
      var count = enrollments.length;
      if (count > this.maxEntries) {
        var enrollment = enrollments[0];
        for (var i = 1; i < enrollments.length; i++) {
          if (enrollments[i]._queryEntry.priority < enrollment.priority) {
            enrolment = enrollments[i]._queryEntry;
          }
        }

        enrollment.endDate = Date.now();
        enrollment.save();
      }
      if (count >= this.maxEntries) {
        minPriority = this.maxEntries;
        for (var i in enrollments) {
          if (enrollments[i].endDate != null) {
            minPriority = Math.min(minPriority, enrollments[i]._queryEntry.priority);
          }
        }
        QueueEntry.find( {_group: this._id}, function(err, entries) {
          entries.forEach(function(entry) {
            if (entry.priority < minPriority) {
              entry.valid = false;
            } else {
              entry.valid = true;
            }
            entry.save();
          });
        });

      }
      cb();
  });
};

groupSchema.methods.addEnrollment = function (courseId, cb) {
  console.log('course id is ');
  console.log(courseId);
  var enrollment = new Enrollment({
    startDate: Date.now(),
    _group: this._id,
    _course: courseId
  });
  enrollment.save(cb);
};

groupSchema.methods.getActiveEnrollment_SingleGroup = function (courseId, cb) {
  var group = this;
  console.log('group is ');
  console.log(group);
  Enrollment.forGroup(this, function (err, enrollments) {
    console.log('enrollments for group ' + group._id);
    console.log(enrollments);
    async.reduce(enrollments, null, function (memo, item, callback) {
      console.log('item is');
      console.log(item);
      console.log(item._course._id);
      console.log(courseId);
      console.log(item._course._id == courseId);
      if (!item.endDate && item._course._id.toString() == courseId) {
        console.log('assigning item to memo');
        memo = item;
      }
      callback(null, memo);
    }, function (err, result) {
      cb(result);
    });
  });
};

groupSchema.statics.getActiveEnrollment = function (user, courseId, cb) {
  console.log('calling getActiveEnrollment with user ' + user._id + ' and course ' + courseId);
  console.log(user._id);
  console.log(courseId);
  Group.find({_user: user._id}, function (err, groups) {
    async.reduce(groups, null, function (memo, item, callback) {
      item.getActiveEnrollment_SingleGroup(courseId, function (result) {
        console.log(result);
        if (result != null) {
          memo = result;
        }
        callback(null, memo);
      });
    }, function (err, result) {
      console.log(err);
      console.log(result);
      cb(result);
    });
  });
};

var Group = mongoose.model('Group', groupSchema);


module.exports = Group;
