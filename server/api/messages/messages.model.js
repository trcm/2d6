'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessagesSchema = new Schema({
  user: String,
  text: String,
  timestamp: Date
});

module.exports = mongoose.model('Messages', MessagesSchema);
