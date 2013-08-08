var mongoose = require('mongoose');
var async = require('async');
var User = require('./user.js');
var Course = require('./course.js');
var Enrollment = require('./enrollment.js');
var Group = require('./group.js');

var addRoutes = function (app) {
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
          Group.findOne({_id: enrollment._group}, function (err, group) {
            if (err) {
              console.log(err);
              cb(err);
              return;
            }
            User.findOne({_id: group._user}, function (err, user) {
              cb(null, user);
            });
          });
        }, function (err, students) {
          res.render('teacher-course', {students: students});
        });
      });
  });

  app.get('/addCourse', function(req, res) {
    res.render('add_course');
  });

  app.post('/addCourse', function(req, res) {
    var data = req.body;
    var user = req.session.user;

    var course = new Course(data);
    course._teacher = user._id;

    course.save(function(err, course) {
      res.redirect('/');
    });
  });

  app.get('/teacherCourses', function(req, res) {
    var user = req.session.user;
    Course.find({_teacher: user._id}, function(err, courses) {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }
      res.write(courses.toString());
      res.end();
    });
  });
};

exports.addRoutes = addRoutes;
