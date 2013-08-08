var assert = require('assert');
var mongoose = require('mongoose');
var request = require('request');
var should = require('should');

var Democracy = require('../server/democracy.js');
var User = require('../server/user.js');

var d = null;

describe('Express', function () {
  before(function (done) {
    console.log('in integration::before');
    d = new Democracy({dbString: 'mongodb://localhost/hackfmi-test', port: 3005});
    request.post({
      uri: 'http://localhost:3005/register',
      json: {
        username: 'test',
        name: 'Test',
        password: 'test'
      }
    }, function (err, res, body) {
      console.log('exiting integration::before');
      done(err);
    });
  });

  after(function (done) {
    User.remove({}, function () {
      d.server.close();
      mongoose.connection.close();
      done();
    });
  });

  it('serves static content', function (done) {
    request('http://localhost:3005/vendor/js/jquery.js', function (err, res, body) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('serves index', function (done) {
    request('http://localhost:3005/', function (err, res, body) {
      res.statusCode.should.equal(200);
      done();
    });
  });
});

