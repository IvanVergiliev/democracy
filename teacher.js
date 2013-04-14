var mongoose = require('mongoose');
var User = require('./user.js');
var Course = require('./course.js');

var addTeacherMethods = function (app) {
  app.get('/teacher-courses', function (req, res) {
    var teacher = req.session.user;
    Course.find({_teacher: teacher._id}, function (err, courses) {
      res.render('teacher-courses-list', {user: req.session.user, courses: courses});
    });
  });

  app.get('/teacher-courses/:id', function (req, res) {
    var teacher = req.session.user._id;
    res.write("ID: " + req.params.id);
  });
};

exports.addTeacherMethods = addTeacherMethods;
