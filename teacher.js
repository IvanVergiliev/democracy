var mongoose = require('mongoose');
var User = require('./user.js');
var Course = require('./course.js');

var Teacher = function (id) {
  this.courses = function () {
    var courses = [];
    Course.find({_teacher: id}, function (err, course) {
      courses.push(course);
    });
    console.log(courses);
  };
}

var addTeacherMethods = function (app) {
  app.get('/statistics', function (req, res) {
    var teacher = new Teacher(req.session.user._id);
  });
}

Teacher.prototype.foobar = function () {
}
