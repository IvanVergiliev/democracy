var express = require('express');
var MemoryStore = require('connect').session.MemoryStore;

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.set('view engine', 'ejs');
app.use(express.session({secret: 'gdfgfdgu8934t9ghervorehg', store: new MemoryStore()}));

app.get('/', function(req, res) {
  res.end(req.session.user);
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  var data = req.body;
  if (data.username == 'omg' && data.password == 'wtf') {
    req.session.user = 'omg';
    res.redirect('/');
  } else {
    res.render('login', {error: 'Потребителското име или паролата са грешни!'});
  }
});

app.listen(3000);
