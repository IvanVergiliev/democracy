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
    .exists('occupation', false)
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
        QueueEntry.find({_group: this._id}, function(err, entries) {
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

var Group = mongoose.model('Group', groupSchema);


module.exports = Group;
