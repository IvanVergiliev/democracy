var async = require('async');
var request = require('request');

var actions = require('./actions.js');
var Course = require('./course.js');
var eventManager = require('./eventManager.js');
var Group = require('./group.js');
var User = require('./user.js');

var Student = function (config) {
  this.config = config;
};

Student.prototype.addRoutes = function (app) {
  var student = this;

  app.get('/', function(req, res) {
    var userId = req.session.user._id;
    Course.find()
      .populate('_teacher')
      .exec(function(err, courses) {
        async.map(courses, function (item, callback) {
          item.getState(userId, function (res) {
            callback(null, res);
          });
        }, function (err, statuses) {
          if (err) {
            console.log(err);
            return;
          }
          res.render('index', {
            courses: courses,
            statuses: statuses,
            user: req.session.user
          });
        });
      });
  });

  app.get('/enrollments', function(req, res) {
    var data = req.body;
    var enr = new Enrollment({startDate: Date.now()});
    async.series([
      function(cb) {
        Group.findOne(function (err, group) {
          Enrollment.forGroup(group, function(err, enr) {
            res.write(enr.toString());
            cb();
          });
        });
      },
      function(cb) {
        Course.findOne(function (err, course) {
          Enrollment.forCourse(course, function(err, enr) {
            res.write(enr.toString());
            cb();
          });
        });
      }],
      function (x) {
        res.end();
    });
  });

  app.post('/enroll', function(req, res) {
    var data = req.body;
    var captchaData = {
      privatekey: student.config.recaptchaPrivate,
      remoteip: req.connection.remoteAddress,
      challenge: data.challenge,
      response: data.response
    };
    request.post(
      'http://www.google.com/recaptcha/api/verify',
      {form: captchaData},
      function (err, recaptchaRes, body) {
        lines = body.split('\n');
        if (lines[0] === 'false') {
          res.json({
            result: 'recaptcha-error',
            msg: 'Неправилно попълнен reCaptcha',
            error: lines[1]
          });
        } else {
          var userId = req.session.user._id;
          var user = User.findOne({_id: userId}, function (err, user) {
            user.canAddGroup(1, function (ok) {
              // TODO: Prone to TOCTOU attacks - MUST be fixed if going to production.
              if (ok) {
                user.addGroup(null, 1, function (err, group) {
                  group.addEnrollment(data.courseId, function (err, enrollment) {
                    eventManager.emit('stateChanged', data.courseId);
                    res.json({
                      result: true
                    });
                  });
                });
                // enroll
                // return OK
              } else {
                res.json({
                  result: false,
                  msg: 'Нямаш право да записваш повече изборни!'
                });
              }
            });
          });
        }
      });
  });

  app.get('/getActiveEnrollment/:courseId', function (req, res) {
    var userId = req.session.user._id;
    Group.getActiveEnrollment(req.session.user, req.params.courseId, function (enrollment) {
      res.json(enrollment);
    });
  });

  app.get('/getState/:courseId', function (req, res) {
    var userId = req.session.user._id;
    var courseId = req.params.courseId;
    Course.findOne({_id: courseId}, function (err, course) {
      course.getState(userId, function (msg) {
        res.end(msg);
      });
    });
  });

  var unenroll = function (enrollment, cb) {
    Group.findOne({_id: enrollment._group}, function(err, group) {
      enrollment.endDate = Date.now();
      var fixEnrollment = function() {
        enrollment.save(function() {
          actions.afterUnregistrationFromCourse(enrollment._course, cb);
        });
      };

      if (!group.name) {
        group.maxEntries = 0;
        group.save(fixEnrollment);
      } else {
        fixEnrollment();
      }
    });
  };

  app.get('/unenroll/:courseId', function(req, res) {
    Group.getActiveEnrollment(req.session.user, req.params.courseId, function (enrollment) {
      unenroll(enrollment, function () {
        res.json({
          result: true
        });
      });
    });
  });

  app.get('/unenroll/:userId/:courseId', function(req, res) {
    User.findOne({_id: Greq.params.userId}, function(err, user) {
      Group.getActiveEnrollment(user, req.params.courseId, unenroll);
    });
  });

  app.get('/dequeue/:courseId', function(req, res) {
    var userId = req.session.user._id;
    var courseId = req.params.courseId;

    Group.getQueueEntry(userId, courseId, function (queueEntry) {
      queueEntry.valid = false;
      queueEntry.save(function() {
        res.json({
          result: true
        });
      });
    });
  });

  app.get('/enqueue/:courseId', function(req, res) {
    var userId = req.session.user._id;
    var courseId = req.params.courseId;

    User.findOne({_id: userId}, function(err, user) {
      user.canAddGroup(1, function(ok) {
        if (ok) {
          user.addGroup(null, 1, function(err, group) {
            group.addQueueEntry(courseId, function(err, queueEntry) {
              res.json({
                result: true,
                msg: 'Записан си за опашката'
              });
            });
          });
        } else {
          res.json({
            result: false,
            msg: 'Нямаш право на повече изборни'
          });
        }
      });
    });
  });

  app.post('/group/add', function (req, res) {
    var data = req.body;
    var user = req.session.user;

    user.addGroup(data.name, data.maxEntries, function(err, group) {
      if (!err) {
        res.json({
          result: false,
          msg: 'Нямаш право на толкова голяма група.'
        });
      } else {
        group.save(function (err, gr) {
          res.json({
            result: true
          });
        });
      }
    });
  });

  app.get('/groups', function (req, res) {
    Group.getWithEnrollments(req.session.user._id, function(err, groups) {
      if (!err) {
        res.json(groups);
      } else {
        res.json(err);
      }
    });
  });
};

module.exports = Student;
