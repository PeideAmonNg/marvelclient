var env = require('./env').env;

exports.config = function() {
  var node_env = 'development' || process.env.NODE_ENV.trim();
  console.log("process.env.NODE_ENV " + process.env.NODE_ENV);
  console.log(node_env);
  console.log("production" == String(node_env).trim());	
  console.log(typeof(node_env));
  console.log(env[node_env]);
  console.log(env["production"]);
  return env[node_env];
};