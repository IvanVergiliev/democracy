var express = require('express');
var async = require('async');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var RequestsCounter = mongoose.model('RequestsCounter', {count: Number});

var foo = function (callback) {
  var counter;
  async.series([
    function (cb) {
      RequestsCounter.findOne(function (err, doc) {
        counter = doc;
        cb();
      });
    },
    function (cb) {
      counter.count += 1;
      counter.save(cb);
    }
  ], function () {
    callback(counter);
  });
}

app.get('/', function(req, res){
  foo(function (counter) {
    res.send('hello world, queries so far:' + counter.count);
    res.end();
  });
});

app.listen(3000);
