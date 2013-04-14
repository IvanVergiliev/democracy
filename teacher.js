var mongoose = require('mongoose');
var async = require('async');
var User = require('./user.js');
var Course = require('./course.js');
var Enrollment = require('./enrollment.js');
var Group = require('./group.js');

var addTeacherMethods = function (app) {
  app.get('/teacher/courses', function (req, res) {
    var teacher = req.session.user;
    Course.find({_teacher: teacher._id}, function (err, courses) {
      async.mapSeries(courses, function (course, cb) {
        Enrollment.find({_course: course._id}, function (err, enrollments) {
          cb(null, enrollments);
        });
      }, function (err, enrollments) {
        res.render('teacher-courses-list',
                   {
                     user: req.session.user,
                     courses: courses,
                     enrollments: enrollments
                   });
      });
    });
  });

  app.get('/teacher/courses/:id', function (req, res) {
    var teacher = req.session.user._id;
    var courseId = req.params.id;
    Enrollment.find({_course: courseId})
      .exists('endDate', false)
      .exec(function (err, enrollments) {
        async.map(enrollments, function (enrollment, cb) {
          Group.findOne({id: enrollment._group}, function (err, group) {
            err && console.log(err);
            User.findOne({id: group._user}, function (err, user) {
              cb(null, user);
            });
          });
        }, function (err, students) {
          res.render('teacher-course', {students: students});
        });
      });
  });
};

exports.addTeacherMethods = addTeacherMethods;
