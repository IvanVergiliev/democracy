var mongoose = require('mongoose');

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


var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

