var mongoose = require('mongoose');

var queueEntrySchema = new mongoose.Schema({
  priority: Number,
  created: Date,
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  _group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
});

var QueueEntry = mongoose.model('QueueEntry', queueEntrySchema);

module.exports = QueueEntry;
