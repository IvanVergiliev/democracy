var mongoose = require('mongoose');
var should = require('should');

var Course = require('../server/course.js');
var User = require('../server/user.js');

describe('Course', function () {
  var userId = null;
  before(function (done) {
    mongoose.connect('mongodb://localhost/hackfmi-test');
    var user = new User({username: 'test', password: 'test'});
    user.save(function (err, user) {
      userId = user._id;
      done();
    });
  });

  after(function (done) {
    User.remove({}, function () {
      mongoose.connection.close();
      done();
    });
  });

  it('with non-zero limit has free spots', function (done) {
    var course = new Course({limit: 10});
    course.getState(userId, function (state) {
      state.should.equal('Free positions');
      done();
    });
  });

  it('with zero limit is full', function (done) {
    var course = new Course({limit: 0});
    course.getState(userId, function (state) {
      state.should.equal('Full');
      done();
    });
  });
});
