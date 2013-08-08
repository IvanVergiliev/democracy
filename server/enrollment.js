var mongoose = require('mongoose');

var enrollmentSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  _group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
});

enrollmentSchema.statics.forGroup = function (group, cb) {
  this.find({ _group: group._id })
    .populate('_course')
    .exec(cb);
};

enrollmentSchema.statics.forCourse = function (course, cb) {
  this.find({ _course: course._id })
    .populate('_group')
    .exec(cb);
};

var Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
