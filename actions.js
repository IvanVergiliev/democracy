var QueueEntry = require('./queue_entry.js');
var Enrollment = require('./enrollment.js');
var Group = require('./group.js');
var async = require('async');

var afterUnregistrationFromCourse = function (courseId, cb) {
  QueueEntry.findOne({_course: courseId})
    .sort({created: 1})
    .where('valid').equals('true')
    .limit(1)
    .populate('_group')
    .populate('_course')
    .exec(function (err, queueEntry) {
      if (err) {
        console.log(err);
        return;
      }

      if (!queueEntry) {
        cb();
        return;
      }

      async.series([
        function(cb) {
          var group = queueEntry._group;
          var enrollment = new Enrollment({startDate: Date.now(), _group: group._id, _course: courseId});
          enrollment.save(cb);
        },
        function(cb) {
          queueEntry.valid = false;
          queueEntry.save(cb);
        },
        function(cb) {
          var group = queueEntry._group;
          group.fix(cb);
        },
      ], function() {
        cb();
      }
      );
  });
}

module.exports.afterUnregistrationFromCourse = afterUnregistrationFromCourse;
