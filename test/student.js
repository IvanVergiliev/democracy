var assert = require('assert');
var mongoose = require('mongoose');
var request = require('request');
var should = require('should');

var Democracy = require('../server/democracy.js');
var Course = require('../server/course');
var User = require('../server/user.js');

var d = null;
var courseId = null;

describe('API', function () {
  before(function (done) {
    console.log('in student::before');
    d = new Democracy({dbString: 'mongodb://localhost/hackfmi-test', port: 3005});
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
          console.log('exiting student::before');
          done();
        });
      });
    });
  });

  after(function (done) {
    User.remove({}, function () {
      Course.remove({}, function () {
        d.server.close();
        mongoose.connection.close();
        done();
      });
    });
  });

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
