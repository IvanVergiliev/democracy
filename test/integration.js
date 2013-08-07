var assert = require('assert');
var request = require('request');
var should = require('should');
var Democracy = require('../democracy.js');
var mongoose = require('mongoose');
var Course = require('../course');
var User = require('../user.js');

var d = new Democracy({dbString: 'mongodb://localhost/hackfmi-test', port: 3005});

var db = mongoose.connection;

var courseId = null;

before(function (done) {
  request.post({
    uri: 'http://localhost:3005/register',
    json: {
      username: 'test',
      name: 'Test',
      password: 'test'
    }
  }, function (err, res, body) {
    if (err) {
      return done(err);
    }
    request.post({
      uri: 'http://localhost:3005/addCourse',
      json: {
        name: 'Test course',
        ects: 5,
        limit: 10
      }
    }, function (err, res, body) {
      if (err) {
        return done(err);
      }
      Course.findOne(function (err, course) {
        if (err) {
          return done(err);
        }
        courseId = course._id;
        done();
      });
    });
  });
});

after(function (done) {
  User.remove({}, done);
  Course.remove({}, done);
});

describe('API', function () {
  describe('Student', function () {
    it('should not be initially enrolled in a course', function (done) {
      request('http://localhost:3005/getState/' + courseId, function (err, res, body) {
        if (err) throw err;
        body.should.equal('Free positions');
        done();
      });
    });
  });
});
