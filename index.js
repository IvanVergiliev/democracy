var express = require('express');
var MemoryStore = require('connect').session.MemoryStore;
var mongoose = require('mongoose');

mongoose.connect('mongodb://164.138.216.139/hackfmi');

var db = mongoose.connection;
db.on('error', function(err) {
  console.error(err);
});

var User = require('./user.js');
var Course = require('./course.js');

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.set('view engine', 'ejs');
app.use(express.session({secret: 'gdfgfdgu8934t9ghervorehg', store: new MemoryStore()}));

app.get('/', function(req, res) {
  Course.find(function(err, courses) {
    err && console.log(err);
    for (var i = 0; i < courses.length; ++i) {
      res.write(courses[i].name);
      res.write('\n');
    }
    res.end();
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

app.listen(3000);
