/**
 * The git co plugin checks out the branch if remote exists.
 */
var fs = require('fs'),
    path = require('path'),
    style = require('../lib/style.js'),
    run = require('../lib/run.js'),
    commandRequirements = require('../lib/command-requirements.js');

var proc = require('child_process');

var pad = function(s, len) {
    return (s.toString().length < len ?
      new Array(len - s.toString().length).join(' ') : '');
};
var print = function(msg, color, branch, req) {
  var cwd = req.path,
      dirname = path.dirname(cwd).replace(req.gr.homePath, '~') + path.sep,
      repos = (req.gr.directories ? req.gr.directories : []),
      pathMaxLen = repos.reduce(function(prev, current) {
        return Math.max(prev, current.replace(req.gr.homePath, '~').length + 2);
      }, 0);
  console.log(
    style(dirname, 'gray') +
    style(path.basename(cwd), 'white') + pad(dirname + path.basename(cwd), pathMaxLen) + ' ' +
    branch + pad(branch, 15) + ' ' +
    style(msg, color)
  );
};

module.exports = function(req, res, next) {
  if (req.argv.length != 1) {
    console.log("Specify branch name");
    return false;
  }
  var branch = req.argv[0];

  if (commandRequirements.changed({ path: req.path })) {
    print('skip - uncommited changes', 'red', branch, req);
    return req.done();
  }

  var task = proc.execSync('git branch --all', {cwd: req.path});
  var lines = task.toString().split('\n').filter(function(line) {
    return !!line.trim();
  });
  if (lines.filter(line => line == "* " + branch).length > 0) {
    print('no action', 'green', branch, req);
    return req.done();
  }

  var branches = lines.map(line => line.replace('*', '').trim());
  if (branches.filter(line => line == branch || line == "remotes/origin/"+branch).length == 0) {
    print('skip - branch not found', 'red', branch, req);
    return req.done();
  }

  try {
    var err = new Buffer(1024);
    var co = proc.execSync('git checkout -q ' + branch , {cwd: req.path, stdio: ['ignore','ignore','ignore']});
    print('checkout', 'green', branch, req);
  } catch(exception) {
    print('checkout', 'red', branch, req);
    console.log(" exception " + exception);
  }

  return req.done();
};
