var env = require('./env').env;


console.log(env["development"]);

exports.config = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};