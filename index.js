var express = require('express');
var async = require('async');
var MemoryStore = require('connect').session.MemoryStore;
var mongoose = require('mongoose');

mongoose.connect('mongodb://164.138.216.139/hackfmi');

var db = mongoose.connection;
db.on('error', function(err) {
  console.error(err);
});

var User = require('./user.js');
var Group = require('./group.js');
var Course = require('./course.js');
var Enrollment = require('./enrollment.js');

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.set('view engine', 'ejs');
app.use(express.session({secret: 'gdfgfdgu8934t9ghervorehg', store: new MemoryStore()}));

app.get('/', function(req, res) {
  Course.find(function(err, courses) {
    err && console.log(err);
    res.render('index', {courses: courses});
  });
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

app.listen(3000);
