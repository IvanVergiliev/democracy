var mongoose = require('mongoose');

var groupSchema = new mongoose.Schema({
  name: String,
  maxEntries: Number,
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;
