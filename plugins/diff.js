/**
 * The git diff plugin runs the diff on modified-only repos.
 */
var fs = require('fs'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js'),
    commandRequirements = require('../lib/command-requirements.js');

var exec = require('child_process').exec;

module.exports = function(req, res, next) {
  if (!commandRequirements.changed({ path: req.path })) {
    return req.done();
  }

  run('git diff', req.path, req.done);
};
