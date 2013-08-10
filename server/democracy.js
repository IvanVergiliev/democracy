var async = require('async');
var express = require('express');
var MemoryStore = require('connect').session.MemoryStore;
var mongoose = require('mongoose');

var Course = require('./course.js');
var eventManager = require('./eventManager.js');
var QueueEntries = require('./queue_entry.js');
var Student = require('./student.js');
var Teacher = require('./teacher.js');
var User = require('./user.js');

var Democracy = function (config) {
  mongoose.connect(config.dbString);

  var db = mongoose.connection;
  db.on('error', function(err) {
    console.error(err);
  });

  var app = this.app = express();

  app.use(express.logger());
  // TODO(ivan): consider mounting this at '/static' to avoid going to
  // disk for every request.
  app.use(express.static(__dirname + '/../client'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'ejs');
  app.use(express.session({secret: 'gdfgfdgu8934t9ghervorehg', store: new MemoryStore()}));

  app.use(function checkLoggedIn(req, res, next) {
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

  app.use(app.router);

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

  Teacher.addRoutes(app);
  var student = new Student(config);
  student.addRoutes(app);

  var http = require('http');
  var server = this.server = http.createServer(app);

  var io = require('socket.io').listen(server);

  server.listen(config.port || 3000);

  io.sockets.on('connection', function (socket) {
    var userId = null;

    socket.on('setUser', function (id) {
      console.log('setting user ' + id);
      userId = id;
    });

    eventManager.on('stateChanged', function (courseId) {
      if (!userId) {
        return;
      }
      Course.findOne({_id: courseId}, function (err, course) {
        console.log('course is ');
        console.log(course);
        course.getState(userId, function (msg) {
          socket.emit('stateChanged', userId, courseId, msg);
        });
      });
    });
  });
};

module.exports = Democracy;
