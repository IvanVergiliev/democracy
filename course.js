var mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
  name: String,
  ects: Number,
  group: String,
  description: String
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;

