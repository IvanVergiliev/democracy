var unregisterFromCourse = function (course) {
  QueryEntry.findOne({_course: course._id})
    .sort({created: 1})
    .where('valid').equals('true')
    .limit(1)
    .populate('_group')
    .populate('_course')
    .exec(function (err, queueEntry) {
      if (err) {
        console.log(err);
        return;
      }

      async.series([
        function(cb) {
          var group = queueEntry._group;
          var enrollment = new Enrollment({startDate: Date.now(), _group: group._id});
          enrollment.save(cb);
        },
        function(cb) {
          queueEntry.remove(cb);
        },
        function(cb) {
          var group = queueEntry._group;
          group.fix(cb);
        },
      ], function() {

      }
      );
  });
}