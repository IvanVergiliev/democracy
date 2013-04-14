var express = require('express');
var async = require('async');
var MemoryStore = require('connect').session.MemoryStore;
var mongoose = require('mongoose');
var actions = require('./actions.js');

mongoose.connect('mongodb://164.138.216.139/hackfmi');

var db = mongoose.connection;
db.on('error', function(err) {
  console.error(err);
});

var User = require('./user.js');
var Group = require('./group.js');
var Course = require('./course.js');
var Enrollment = require('./enrollment.js');
var QueueEntries = require('./queue_entry.js');
var Event = require('./event.js');

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.set('view engine', 'ejs');
app.use(express.session({secret: 'gdfgfdgu8934t9ghervorehg', store: new MemoryStore()}));

app.use(function(req, res, next) {
  if (req.path == '/login' || req.path == '/register') {
    next();
    return;
  }
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  var data = req.body;
  User.exists(data.username, data.password, function (err, user) {
    if (err || !user) {
      res.render('login', {error: 'Потребителското име или паролата са грешни!'});
      return;
    }
    req.session.user = user;
    res.redirect('/');
  });
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  var data = req.body;
  var user = new User(data);
  user.save(function(err, user) {
    req.session.user = user;
    res.redirect('/');
  });
});

app.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/login');
});

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
        console.log(courses.toString());
        res.render('index', {
          courses: courses,
          statuses: statuses,
          user: req.session.user
        });
      });
    });
});

var teacher = require('./teacher.js');
teacher.addTeacherMethods(app);

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

app.get('/addCourse', function(req, res){
  res.render('add_course');
});

app.post('/addCourse', function(req, res){
  var data = req.body;
  var user = req.session.user;

  var course = new Course(data);
  course._teacher = user._id;

  course.save(function(err, user) {
    res.redirect('/');
  });
});

app.get('/teacherCourses', function(req, res) {
  var user = req.session.user;
  Course.find({_teacher: user._id}, function(err, courses) {
    err && console.log(err);
    res.write(courses.toString());
    res.end();
  });
});

app.post('/enroll', function(req, res) {
  var data = req.body;
  var userId = req.session.user._id;
  console.log('course id is ');
  console.log(data.courseId);
  var user = User.findOne({_id: userId}, function (err, user) {
    console.log(user);
    user.canAddGroup(1, function (ok) {
      // TODO: Prone to TOCTOU attacks - MUST be fix if going to production.
      if (ok) {
        user.addGroup(null, 1, function (err, group) {
          group.addEnrollment(data.courseId, function (err, enrollment) {
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
    console.log('course is ');
    console.log(course);
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
}

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

app.listen(3000);
