var env = require('./env').env;


console.log(env["development"]);
console.log(process.env.NODE_ENV);
console.log(env[process.env.NODE_ENV]);

exports.config = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};