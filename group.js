var mongoose = require('mongoose');

var groupSchema = new mongoose.Schema({
  name: String,
  maxEntries: Number,
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

groupSchema.maethods.fix = function (cb) {
  Enrollment
    .find({_group: this._id})
    .exists('occupation', false)
    .populate("_queueEntry")
    .exec(function(err, enrollments) {
      var count = enrollments.length();
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
}

var Group = mongoose.model('Group', groupSchema);


module.exports = Group;
