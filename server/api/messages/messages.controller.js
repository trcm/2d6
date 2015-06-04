'use strict';

var _ = require('lodash');
var Messages = require('./messages.model');

// Get list of messagess
exports.index = function(req, res) {
  Messages.find(function (err, messagess) {
    if(err) { return handleError(res, err); }
    return res.json(200, messagess);
  });
};

// Get a single messages
exports.show = function(req, res) {
  Messages.findById(req.params.id, function (err, messages) {
    if(err) { return handleError(res, err); }
    if(!messages) { return res.send(404); }
    return res.json(messages);
  });
};

// Creates a new messages in the DB.
exports.create = function(req, res) {
  // add a time stamp tothe req body as now
  req.body.timestamp = Date.now();
  Messages.create(req.body, function(err, messages) {
    if(err) { return handleError(res, err); }
    return res.json(201, messages);
  });
};

// Updates an existing messages in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Messages.findById(req.params.id, function (err, messages) {
    if (err) { return handleError(res, err); }
    if(!messages) { return res.send(404); }
    var updated = _.merge(messages, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, messages);
    });
  });
};

// Deletes a messages from the DB.
exports.destroy = function(req, res) {
  Messages.findById(req.params.id, function (err, messages) {
    if(err) { return handleError(res, err); }
    if(!messages) { return res.send(404); }
    messages.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
