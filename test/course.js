var mongoose = require('mongoose');
var should = require('should');

var Course = require('../server/course.js');
var eventManager = require('../server/eventManager.js');
var User = require('../server/user.js');

describe('Course', function () {
  var userId = null;
  beforeEach(function (done) {
    mongoose.connect('mongodb://localhost/hackfmi-test');
    var user = new User({username: 'test', password: 'test'});
    user.save(function (err, user) {
      userId = user._id;
      done();
    });
  });

  afterEach(function (done) {
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

  describe('enroll', function () {
    var courseId = null;

    beforeEach(function (done) {
      var course = new Course({name: 'test', limit: 1, enrolled: 0});
      course.save(function (err, course) {
        courseId = course._id;
        done();
      });
    });

    afterEach(function (done) {
      Course.remove({_id: courseId}, done);
    });

    it('enrolls a student and state reflects the enrollment', function (done) {
      Course.enroll(userId, courseId, function (err) {
        should.not.exist(err);
        eventManager.on('enrolled', function (curCourseId, curUserId) {
          courseId.toString().should.equal(curCourseId.toString());
          userId.toString().should.equal(curUserId.toString());
          done();
        });
      });
    });

    it('does not enroll a student who\'s reached his limit', function (done) {
      var oldFunc = User.prototype.maxSimultaneous;
      User.prototype.maxSimultaneous = function () { return 0; };
      Course.enroll(userId, courseId, function (err) {
        err.should.equal('GroupLimitExceeded');
        User.prototype.maxSimultaneous = oldFunc;
        User.findOne({_id: userId}, function (err, user) {
          user.enrolledIn.should.equal(0);
          done();
        });
      });
    });

    it('does not enroll a student in a full course', function (done) {
      Course.update({_id: courseId}, {limit: 0}, function () {
        Course.enroll(userId, courseId, function (err) {
          should.not.exist(err);
          var timeoutId = setTimeout(function () {
            done();
          }, 100);
          eventManager.on('enrolled', function() {
            clearTimeout(timeoutId);
            should.fail('Student was enrolled although course is full.');
          });
//          err.should.equal('CourseFull');
//          Course.findOne({_id: courseId}, function (err, course) {
//            course.enrolled.should.equal(0);
//            done();
//          });
        });
      });
    });
  });
});
