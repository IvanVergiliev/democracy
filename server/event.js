var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  msg: String,
  seen: Boolean,
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});


var Event = mongoose.model('Event', eventSchema);

module.exports = Event;
