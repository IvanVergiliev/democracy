var mongoose = require('mongoose');

var enrollmentSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
});

enrollmentSchema.statics.forUser = function (user, cb) {
  this.find({ _user: user._id })
    .populate('_course')
    .exec(cb);
};

enrollmentSchema.statics.forCourse = function (course, cb) {
  this.find({ _course: course._id })
    .populate('_user')
    .exec(cb);
};

var Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
